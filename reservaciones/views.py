from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now

from .models import Reservacion, Tipoestancia, Estadoreservacion, Paqueteadicional
from mascotas.models import Mascota
from habitaciones.models import Habitacion
from core.utils import get_usuario_session, is_admin, is_due
from habitaciones.serializers import HabitacionListSerializer

from .serializers import (
    ReservacionListSerializer, 
    ReservacionCreateSerializer,
    CambiarEstadoReservacionSerializer,
    TipoEstanciaSerializer,
    PaqueteAdicionalSerializer
)

class MisReservacionesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario or not is_due(usuario):
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        reservaciones = Reservacion.objects.filter(mascota__dueno_usuario_id=usuario.usuario_id) \
            .select_related('mascota', 'habitacion', 'tipo_estancia', 'estado_reservacion') \
            .prefetch_related('paquetes_contratados__paquete') \
            .order_by('-creada_en')
            
        serializer = ReservacionListSerializer(reservaciones, many=True)
        return Response(serializer.data)


class CrearReservacionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario = get_usuario_session(request)
        if not usuario or not is_due(usuario):
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ReservacionCreateSerializer(data=request.data, context={'usuario_id': usuario.usuario_id})
        if serializer.is_valid():
            res_obj = serializer.save()
            
            res_obj = Reservacion.objects.select_related(
                'mascota', 'habitacion', 'tipo_estancia', 'estado_reservacion'
            ).prefetch_related('paquetes_contratados__paquete').get(pk=res_obj.pk)
            
            return Response(ReservacionListSerializer(res_obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TodasReservacionesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        queryset = Reservacion.objects.select_related(
            'mascota', 'habitacion', 'tipo_estancia', 'estado_reservacion'
        ).prefetch_related('paquetes_contratados__paquete').order_by('-creada_en')
        
        estado = request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado_reservacion__nombre=estado)
            
        fecha_inicio = request.query_params.get('fecha_inicio')
        if fecha_inicio:
            queryset = queryset.filter(fecha_inicio=fecha_inicio)
            
        serializer = ReservacionListSerializer(queryset, many=True)
        return Response(serializer.data)


class CambiarEstadoReservacionView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, reservacion_id):
        usuario = get_usuario_session(request)
        if not usuario or not is_admin(usuario):
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            reservacion = Reservacion.objects.get(pk=reservacion_id)
        except Reservacion.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = CambiarEstadoReservacionSerializer(reservacion, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(modificada_en=now())
            
            res_actualizada = Reservacion.objects.select_related(
                'mascota', 'habitacion', 'tipo_estancia', 'estado_reservacion'
            ).prefetch_related('paquetes_contratados__paquete').get(pk=reservacion_id)
            
            return Response(ReservacionListSerializer(res_actualizada).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TiposEstanciaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario:
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
            
        tipos = Tipoestancia.objects.all().order_by('tipo_estancia_id')
        return Response(TipoEstanciaSerializer(tipos, many=True).data)


class PaquetesAdicionalesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario:
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
            
        paquetes = Paqueteadicional.objects.filter(activo=True)
        return Response(PaqueteAdicionalSerializer(paquetes, many=True).data)


class HabitacionesDisponiblesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario = get_usuario_session(request)
        if not usuario:
            return Response({'error': 'No autenticado'}, status=401)

        # Habitaciones con reservaciones activas (bloqueadas)
        habitaciones_ocupadas = Reservacion.objects.filter(
            estado_reservacion__nombre__in=['Pendiente', 'Confirmada', 'En curso']
        ).values_list('habitacion_id', flat=True)

        queryset = Habitacion.objects.select_related(
            'tipo_habitacion', 'estado_habitacion'
        ).filter(
            activa=True,
            estado_habitacion__nombre='Disponible'
        ).exclude(
            habitacion_id__in=habitaciones_ocupadas
        )

        tipo_habitacion_id = request.query_params.get('tipo_habitacion_id')
        if tipo_habitacion_id:
            queryset = queryset.filter(tipo_habitacion_id=tipo_habitacion_id)

        from habitaciones.serializers import HabitacionListSerializer
        return Response(HabitacionListSerializer(queryset, many=True).data)
