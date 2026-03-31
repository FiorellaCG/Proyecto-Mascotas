from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from usuarios.models import Usuario, Rol
from django.utils.timezone import now

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

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirmar_password = serializers.CharField(write_only=True, required=True)
    telefono = serializers.CharField(allow_blank=True, required=False)
    
    class Meta:
        model = Usuario
        fields = ['nombre', 'apellidos', 'cedula', 'correo', 'telefono', 'password', 'confirmar_password']

    def validate(self, data):
        if data['password'] != data['confirmar_password']:
            raise serializers.ValidationError({'confirmar_password': 'Las contraseñas no coinciden'})
        if Usuario.objects.filter(cedula=data.get('cedula')).exists():
            raise serializers.ValidationError({'cedula': 'Ya existe un usuario con esta cédula'})
        if Usuario.objects.filter(correo=data.get('correo')).exists():
            raise serializers.ValidationError({'correo': 'Ya existe un usuario con este correo'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirmar_password')
        password = validated_data.pop('password')
        
        try:
            rol = Rol.objects.get(nombre='Dueño')
        except Rol.DoesNotExist:
            raise serializers.ValidationError({'rol': 'Rol Dueño no encontrado'})
            
        usuario = Usuario(
            rol=rol,
            nombre=validated_data.get('nombre'),
            apellidos=validated_data.get('apellidos'),
            cedula=validated_data.get('cedula'),
            correo=validated_data.get('correo'),
            telefono=validated_data.get('telefono', ''),
            password=make_password(password),
            activo=True,
            fecha_registro=now(),
        )
        usuario.save()
        return usuario
