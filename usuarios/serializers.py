from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from usuarios.models import Usuario

class LoginSerializer(serializers.Serializer):
    correo = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        correo = attrs.get('correo')
        password = attrs.get('password')

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('Credenciales incorrectas')

        if not check_password(password, usuario.password):
            raise serializers.ValidationError('Credenciales incorrectas')

        if not usuario.activo:
            raise serializers.ValidationError('Usuario inactivo')

        attrs['usuario'] = usuario
        return attrs

class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'usuario_id', 'nombre', 'apellidos', 'correo', 'cedula', 
            'telefono', 'activo', 'rol_nombre'
        ]

    def get_rol_nombre(self, obj):
        return obj.rol.nombre
