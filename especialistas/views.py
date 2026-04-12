from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.utils import get_usuario_session, is_admin
from especialistas.models import Especialista, Turno
from especialistas.serializers import (
    EspecialistaListSerializer,
    EspecialistaCreateSerializer,
    TurnoSerializer
)

class ListarEspecialistasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        especialistas = Especialista.objects.select_related('usuario', 'turno').filter(activo=True)
        serializer = EspecialistaListSerializer(especialistas, many=True)
        return Response(serializer.data)

class CrearEspecialistaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        serializer = EspecialistaCreateSerializer(data=request.data)
        if serializer.is_valid():
            especialista = serializer.save()
            return Response(EspecialistaListSerializer(especialista).data, status=201)
        return Response(serializer.errors, status=400)

class ListarTurnosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        turnos = Turno.objects.all().order_by('turno_id')
        serializer = TurnoSerializer(turnos, many=True)
        return Response(serializer.data)
