from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Habitacion, Tipohabitacion, Estadohabitacion,
    Limpiezahabitacion, Mantenimientohabitacion
)
from .serializers import (
    HabitacionListSerializer, HabitacionDetailSerializer,
    HabitacionCreateUpdateSerializer, TipohabitacionSerializer,
    HabitacionCreateSerializer,
    LimpiezahabitacionSerializer, LimpiezahabitacionCreateSerializer,
    MantenimientohabitacionSerializer, MantenimientohabitacionCreateSerializer,
    EstadohabitacionSerializer
)
from core.utils import get_usuario_session, is_admin, is_personal_limpieza


# RF-19: Listar todas las habitaciones (Admin only, con filtro por estado)
class ListAllHabitacionesView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Validar que sea administrador
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response(
                {'error': 'Se requieren permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtener filtro de estado si existe
        estado_id = request.query_params.get('estado_id')
        
        queryset = Habitacion.objects.select_related(
            'tipo_habitacion', 'estado_habitacion'
        )

        if estado_id:
            queryset = queryset.filter(estado_habitacion_id=estado_id)

        serializer = HabitacionListSerializer(queryset, many=True)
        return Response(serializer.data)


# RF-20: Obtener detalle de habitación y cambiar estado
class HabitacionDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        """Obtener detalle de una habitación"""
        try:
            habitacion = Habitacion.objects.select_related(
                'tipo_habitacion', 'estado_habitacion'
            ).prefetch_related('limpiezas', 'mantenimientos').get(
                habitacion_id=pk
            )
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = HabitacionDetailSerializer(habitacion)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Cambiar estado de la habitación (Admin only)"""
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response(
                {'error': 'Se requieren permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            habitacion = Habitacion.objects.get(habitacion_id=pk)
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = HabitacionCreateUpdateSerializer(
            habitacion, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'mensaje': 'Habitación actualizada correctamente',
                'habitacion': HabitacionDetailSerializer(habitacion).data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'Sin permiso'}, status=403)
        try:
            habitacion = Habitacion.objects.get(habitacion_id=pk)
        except Habitacion.DoesNotExist:
            return Response({'error': 'No encontrada'}, status=404)

        serializer = HabitacionCreateUpdateSerializer(
            habitacion, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(HabitacionDetailSerializer(
                Habitacion.objects.select_related(
                    'tipo_habitacion', 'estado_habitacion'
                ).get(pk=pk)
            ).data)
        return Response(serializer.errors, status=400)


# RF-21 y RF-22: Limpiezas de una habitación (Listar y Registrar)
class ListLimpiezasView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, habitacion_id):
        """Obtener historial de limpiezas de una habitación"""
        try:
            habitacion = Habitacion.objects.get(habitacion_id=habitacion_id)
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        limpiezas = habitacion.limpiezas.select_related('realizada_por').order_by('-fecha_limpieza')
        serializer = LimpiezahabitacionSerializer(limpiezas, many=True)
        
        return Response({
            'habitacion_id': habitacion_id,
            'habitacion_numero': habitacion.numero,
            'total_limpiezas': limpiezas.count(),
            'limpiezas': serializer.data
        })

    def post(self, request, habitacion_id):
        """Registrar una limpieza"""
        usuario = get_usuario_session(request)
        if not usuario:
            return Response(
                {'error': 'Usuario no autenticado'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            habitacion = Habitacion.objects.get(habitacion_id=habitacion_id)
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LimpiezahabitacionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'mensaje': 'Limpieza registrada correctamente',
                    'limpieza_id': serializer.instance.limpieza_id
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# RF-23: Listar mantenimientos pendientes de una habitación
class ListMantenimientosView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, habitacion_id):
        """Obtener mantenimientos (pendientes o todos) de una habitación"""
        try:
            habitacion = Habitacion.objects.get(habitacion_id=habitacion_id)
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Filtrar solo pendientes si se especifica
        solo_pendientes = request.query_params.get('pendientes', 'false').lower() == 'true'
        
        mantenimientos = habitacion.mantenimientos.select_related('realizado_por')
        
        if solo_pendientes:
            mantenimientos = mantenimientos.filter(completado=False)
        
        mantenimientos = mantenimientos.order_by('-fecha_solicitud')
        serializer = MantenimientohabitacionSerializer(mantenimientos, many=True)
        
        return Response({
            'habitacion_id': habitacion_id,
            'habitacion_numero': habitacion.numero,
            'total_mantenimientos': mantenimientos.count(),
            'mantenimientos': serializer.data
        })

    def post(self, request, habitacion_id):
        """Crear solicitud de mantenimiento"""
        try:
            habitacion = Habitacion.objects.get(habitacion_id=habitacion_id)
        except Habitacion.DoesNotExist:
            return Response(
                {'error': 'Habitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        request.data['habitacion'] = habitacion_id
        serializer = MantenimientohabitacionCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'mensaje': 'Solicitud de mantenimiento creada',
                    'mantenimiento_id': serializer.instance.mantenimiento_id
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompletarMantenimientoView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, mantenimiento_id):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'Sin permiso'}, status=403)
        try:
            mant = Mantenimientohabitacion.objects.get(pk=mantenimiento_id)
        except Mantenimientohabitacion.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=404)

        completado = request.data.get('completado')
        if completado is None:
            return Response({'error': 'Campo completado requerido'}, status=400)

        mant.completado = bool(completado)
        if bool(completado):
            from django.utils.timezone import now
            mant.fecha_realizacion = now().date()
            mant.realizado_por_id = usuario.usuario_id
        mant.save()
        return Response(MantenimientohabitacionSerializer(mant).data)


# RF-24: Listar tipos de habitación
class TiposHabitacionView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        """Obtener todos los tipos de habitación"""
        tipos = Tipohabitacion.objects.all()
        serializer = TipohabitacionSerializer(tipos, many=True)
        return Response(serializer.data)


# Vista auxiliar: Obtener todos los estados
class EstadosHabitacionView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        """Obtener todos los estados de habitación"""
        estados = Estadohabitacion.objects.all()
        serializer = EstadohabitacionSerializer(estados, many=True)
        return Response(serializer.data)

class HabitacionesPersonalView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario:
            return Response({'error': 'No autenticado'}, status=401)
        if not is_admin(usuario) and not is_personal_limpieza(usuario):
            return Response({'error': 'Sin permiso'}, status=403)
        queryset = Habitacion.objects.select_related(
            'tipo_habitacion', 'estado_habitacion'
        ).filter(activa=True)
        return Response(HabitacionListSerializer(queryset, many=True).data)

class MisLimpiezasView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario:
            return Response({'error': 'No autenticado'}, status=401)
        limpiezas = Limpiezahabitacion.objects.filter(
            realizada_por_id=usuario.usuario_id
        ).select_related(
            'habitacion',
            'habitacion__tipo_habitacion',
            'habitacion__estado_habitacion',
            'realizada_por'
        ).order_by('-fecha_limpieza')
        serializer = LimpiezahabitacionSerializer(limpiezas, many=True)
        return Response(serializer.data)

class CrearHabitacionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'Sin permiso'}, status=403)
        serializer = HabitacionCreateSerializer(data=request.data)
        if serializer.is_valid():
            habitacion = serializer.save()
            return Response(HabitacionListSerializer(habitacion).data, status=201)
        return Response(serializer.errors, status=400)

class EditarCamaraView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'Sin permiso'}, status=403)
        try:
            habitacion = Habitacion.objects.get(pk=pk)
        except Habitacion.DoesNotExist:
            return Response({'error': 'No encontrada'}, status=404)

        url_camara = request.data.get('url_camara', '').strip()
        habitacion.url_camara = url_camara if url_camara else None
        habitacion.save()
        return Response(HabitacionDetailSerializer(habitacion).data)
