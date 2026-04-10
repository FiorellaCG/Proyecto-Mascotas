from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from usuarios.models import Usuario
from mascotas.models import Mascota, Nivelasistencia, Tipocuidadoespecial
from especialistas.models import Especialista
from mascotas.serializers import (
    NivelAsistenciaSerializer, TipoCuidadoSerializer,
    MascotaListSerializer, MascotaDetailSerializer, MascotaCreateSerializer
)

def get_usuario_session(request):
    usuario_id = request.session.get('usuario_id')
    if not usuario_id:
        return None, Response({'detail': 'No autenticado'}, status=401)
    try:
        usuario = Usuario.objects.select_related('rol').get(pk=usuario_id)
        return usuario, None
    except Usuario.DoesNotExist:
        return None, Response({'detail': 'Usuario no encontrado'}, status=404)

class MisMascotasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario, err = get_usuario_session(request)
        if err: return err
        mascotas = Mascota.objects.filter(dueno_usuario_id=usuario.usuario_id, activa=True)\
                    .select_related('nivel_asistencia', 'especialista__usuario')\
                    .prefetch_related('cuidados_especiales__tipo_cuidado')
        return Response(MascotaListSerializer(mascotas, many=True).data)

class RegistrarMascotaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Dueño':
            return Response({'detail': 'Sin permiso'}, status=403)
        serializer = MascotaCreateSerializer(data=request.data,
                        context={'usuario_id': usuario.usuario_id})
        if serializer.is_valid():
            mascota = serializer.save()
            return Response(MascotaDetailSerializer(mascota).data, status=201)
        return Response(serializer.errors, status=400)

class MascotaDetalleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        usuario, err = get_usuario_session(request)
        if err: return err
        mascota = get_object_or_404(Mascota, pk=pk, dueno_usuario_id=usuario.usuario_id)
        return Response(MascotaDetailSerializer(mascota).data)

class MascotasPendientesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Administrador':
            return Response({'detail': 'Sin permiso'}, status=403)
        mascotas = Mascota.objects.filter(aprobada=None, activa=True)\
                    .select_related('dueno_usuario', 'nivel_asistencia')
        return Response(MascotaDetailSerializer(mascotas, many=True).data)

class AprobarMascotaView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Administrador':
            return Response({'detail': 'Sin permiso'}, status=403)
        mascota = get_object_or_404(Mascota, pk=pk)
        aprobar = request.data.get('aprobar')
        mascota.aprobada = bool(aprobar)
        mascota.aprobada_por_id = usuario.usuario_id
        mascota.fecha_aprobacion = now()
        mascota.save()
        msg = 'Mascota aprobada' if aprobar else 'Mascota rechazada'
        return Response({'detail': msg})

class TodasMascotasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Administrador':
            return Response({'detail': 'Sin permiso'}, status=403)
        qs = Mascota.objects.filter(activa=True).select_related('nivel_asistencia', 'dueno_usuario')
        aprobada_param = request.query_params.get('aprobada')
        if aprobada_param == 'true':   qs = qs.filter(aprobada=True)
        elif aprobada_param == 'false': qs = qs.filter(aprobada=False)
        elif aprobada_param == 'pendiente': qs = qs.filter(aprobada=None)
        especie = request.query_params.get('especie')
        if especie: qs = qs.filter(especie=especie)
        return Response(MascotaListSerializer(qs, many=True).data)

class NivelesAsistenciaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(NivelAsistenciaSerializer(Nivelasistencia.objects.all().order_by('nivel_id'), many=True).data)

class TiposCuidadoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(TipoCuidadoSerializer(Tipocuidadoespecial.objects.all().order_by('tipo_cuidado_id'), many=True).data)

class AsignarEspecialistaView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, mascota_id):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Administrador':
            return Response({'detail': 'Sin permiso'}, status=403)
        mascota = get_object_or_404(Mascota, pk=mascota_id)
        if not mascota.aprobada:
            return Response({'detail': 'La mascota debe estar aprobada para asignar un especialista'}, status=400)
        especialista_id = request.data.get('especialista_id')
        if not especialista_id:
            return Response({'detail': 'especialista_id es requerido'}, status=400)
        
        especialista = get_object_or_404(Especialista, pk=especialista_id)
        if not especialista.activo:
            return Response({'detail': 'El especialista seleccionado no está activo'}, status=400)
            
        mascota.especialista = especialista
        mascota.save()
        return Response({
            'detail': f'Especialista {especialista.usuario.nombre} asignado a {mascota.nombre}',
            'mascota_id': mascota.mascota_id,
            'especialista_id': especialista.especialista_id,
            'especialista_nombre': f'{especialista.usuario.nombre} {especialista.usuario.apellidos}'
        })

class EspecialistasActivosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario, err = get_usuario_session(request)
        if err: return err
        if usuario.rol.nombre != 'Administrador':
            return Response({'detail': 'Sin permiso'}, status=403)
        
        especialistas = Especialista.objects.filter(activo=True).select_related('usuario')
        data = [{
            'especialista_id': e.especialista_id,
            'nombre_completo': f'{e.usuario.nombre} {e.usuario.apellidos}',
            'especialidad': e.especialidad
        } for e in especialistas]
        
        return Response(data)
