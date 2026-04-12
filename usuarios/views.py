from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now
from core.utils import get_usuario_session, is_admin
from usuarios.serializers import LoginSerializer, UsuarioSerializer, RegistroSerializer, RolSerializer, UsuarioAdminCreateSerializer, UsuarioListSerializer
from usuarios.models import Usuario, Rol

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data['usuario']

        # Store user ID in session
        request.session['usuario_id'] = usuario.pk
        
        # Update ultimo_acceso
        Usuario.objects.filter(pk=usuario.pk).update(ultimo_acceso=now())

        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_200_OK)

class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            # Iniciar sesión automáticamente después del registro
            request.session['usuario_id'] = usuario.usuario_id
            Usuario.objects.filter(pk=usuario.usuario_id).update(ultimo_acceso=now())
            return Response(UsuarioSerializer(usuario).data, status=201)
        return Response(serializer.errors, status=400)

class LogoutView(APIView):
    # Depending on settings, IsAuthenticated is usually the default, but we can allow anyone to log out if they want
    permission_classes = [AllowAny]

    def post(self, request):
        request.session.flush()
        return Response({'detail': 'Sesión cerrada'}, status=200)

class MeView(APIView):
    permission_classes = [AllowAny] # We handle the 401 manually since we use custom session variable instead of request.user

    def get(self, request):
        usuario_id = request.session.get('usuario_id')
        if not usuario_id:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            usuario = Usuario.objects.select_related('rol').get(pk=usuario_id)
            return Response(UsuarioSerializer(usuario).data, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
            
class ListarUsuariosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        usuarios = Usuario.objects.select_related('rol').filter(activo=True).order_by('nombre')
        serializer = UsuarioListSerializer(usuarios, many=True)
        return Response(serializer.data)

class CrearUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        serializer = UsuarioAdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(UsuarioListSerializer(usuario).data, status=201)
        return Response(serializer.errors, status=400)

class ListarRolesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        usuario_session = get_usuario_session(request)
        if not is_admin(usuario_session):
            return Response({'error': 'No autorizado'}, status=403)
        roles = Rol.objects.all().order_by('rol_id')
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data)
