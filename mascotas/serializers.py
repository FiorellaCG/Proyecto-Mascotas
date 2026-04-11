from rest_framework import serializers
from usuarios.models import Usuario
from mascotas.models import Mascota, Nivelasistencia, Tipocuidadoespecial, Mascotacuidadoespecial
from django.utils.timezone import now

class NivelAsistenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nivelasistencia
        fields = ['nivel_id', 'nombre', 'descripcion']

class TipoCuidadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipocuidadoespecial
        fields = ['tipo_cuidado_id', 'nombre']

class CuidadoEspecialSerializer(serializers.ModelSerializer):
    tipo_cuidado = TipoCuidadoSerializer(read_only=True)
    tipo_cuidado_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Mascotacuidadoespecial
        fields = ['cuidado_mascota_id', 'tipo_cuidado', 'tipo_cuidado_id', 'descripcion', 'fecha_registro', 'activo']

class MascotaListSerializer(serializers.ModelSerializer):
    nivel_asistencia = NivelAsistenciaSerializer(read_only=True)
    especialista_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Mascota
        fields = [
            'mascota_id', 'nombre', 'especie', 'raza', 'fecha_nacimiento',
            'nivel_asistencia', 'aprobada', 'activa', 'fecha_ingreso_sys',
            'especialista_nombre'
        ]

    def get_especialista_nombre(self, obj):
        if obj.especialista and obj.especialista.usuario:
            return f"{obj.especialista.usuario.nombre} {obj.especialista.usuario.apellidos}"
        return None

class MascotaDetailSerializer(MascotaListSerializer):
    cuidados_especiales = CuidadoEspecialSerializer(many=True, read_only=True, source='cuidados_especiales.all')
    dueno_nombre = serializers.SerializerMethodField()
    especialista_nombre = serializers.SerializerMethodField()

    class Meta(MascotaListSerializer.Meta):
        fields = MascotaListSerializer.Meta.fields + ['cuidados_especiales', 'dueno_nombre', 'especialista_nombre']

    def get_dueno_nombre(self, obj):
        if obj.dueno_usuario:
            return f"{obj.dueno_usuario.nombre} {obj.dueno_usuario.apellidos}"
        return ""

    def get_especialista_nombre(self, obj):
        if hasattr(obj, 'especialista') and obj.especialista:
            return str(obj.especialista)
        return None

class MascotaCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(required=True)
    especie = serializers.CharField(allow_blank=True, required=False)
    raza = serializers.CharField(allow_blank=True, required=False)
    fecha_nacimiento = serializers.DateField(allow_null=True, required=False)
    nivel_asistencia_id = serializers.IntegerField(required=True)
    observaciones = serializers.CharField(allow_blank=True, required=False)
    cuidados = serializers.ListField(child=serializers.DictField(), required=False, default=[])

    def create(self, validated_data):
        cuidados = validated_data.pop('cuidados', [])
        usuario_id = self.context['usuario_id']
        mascota = Mascota.objects.create(
            dueno_usuario_id=usuario_id,
            nivel_asistencia_id=validated_data['nivel_asistencia_id'],
            nombre=validated_data['nombre'],
            especie=validated_data.get('especie', ''),
            raza=validated_data.get('raza', ''),
            fecha_nacimiento=validated_data.get('fecha_nacimiento'),
            observaciones=validated_data.get('observaciones', ''),
            aprobada=None,
            activa=True,
            fecha_ingreso_sys=now(),
        )
        for cuidado in cuidados:
            Mascotacuidadoespecial.objects.create(
                mascota=mascota,
                tipo_cuidado_id=cuidado['tipo_cuidado_id'],
                descripcion=cuidado['descripcion'],
                fecha_registro=now(),
                activo=True,
            )
        return mascota
