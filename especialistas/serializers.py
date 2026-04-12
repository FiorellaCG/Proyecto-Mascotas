from rest_framework import serializers
from especialistas.models import Especialista, Turno
from usuarios.models import Usuario
from usuarios.models import Usuario

class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = ['turno_id', 'nombre', 'hora_inicio', 'hora_fin']

class EspecialistaCreateSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(required=True)
    turno_id = serializers.IntegerField(required=True)
    especialidad = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Especialista
        fields = ['usuario_id', 'turno_id', 'especialidad', 'fecha_ingreso']

    def validate(self, data):
        usuario_id = data.get('usuario_id')
        try:
            usuario = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError({'usuario_id': 'Usuario no encontrado'})

        if getattr(usuario.rol, 'nombre', '') != 'Especialista':
            raise serializers.ValidationError({'usuario_id': 'El usuario no tiene rol Especialista'})

        if hasattr(usuario, 'especialista_perfil'):
            raise serializers.ValidationError({'usuario_id': 'Este usuario ya tiene un perfil de Especialista'})

        return data

    def create(self, validated_data):
        especialista = Especialista(
            usuario_id=validated_data['usuario_id'],
            turno_id=validated_data['turno_id'],
            especialidad=validated_data.get('especialidad', ''),
            fecha_ingreso=validated_data['fecha_ingreso'],
            activo=True
        )
        especialista.save()
        return especialista

class EspecialistaListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    turno = TurnoSerializer(read_only=True)
    correo = serializers.SerializerMethodField()

    class Meta:
        model = Especialista
        fields = ['especialista_id', 'especialidad', 'fecha_ingreso', 'activo', 'nombre_completo', 'turno', 'correo']

    def get_nombre_completo(self, obj):
        return f"{obj.usuario.nombre} {obj.usuario.apellidos}"

    def get_correo(self, obj):
        return obj.usuario.correo
