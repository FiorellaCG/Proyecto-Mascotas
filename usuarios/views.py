from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.timezone import now
from usuarios.models import Usuario
from usuarios.serializers import LoginSerializer, UsuarioSerializer, RegistroSerializer

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
