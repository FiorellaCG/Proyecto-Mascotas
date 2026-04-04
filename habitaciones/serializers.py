from rest_framework import serializers
from .models import (
    Tipohabitacion, Estadohabitacion, Habitacion,
    Limpiezahabitacion, Mantenimientohabitacion
)
from usuarios.models import Usuario


class TipohabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipohabitacion
        fields = ['tipo_habitacion_id', 'nombre', 'descripcion', 'tiene_camara']


class EstadohabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estadohabitacion
        fields = ['estado_habitacion_id', 'nombre']


class UsuarioBasicSerializer(serializers.ModelSerializer):
    """Serializer simple para mostrar solo nombre e id"""
    class Meta:
        model = Usuario
        fields = ['usuario_id', 'nombre']


class LimpiezahabitacionSerializer(serializers.ModelSerializer):
    realizada_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Limpiezahabitacion
        fields = [
            'limpieza_id', 'habitacion', 'realizada_por', 'realizada_por_nombre',
            'fecha_limpieza', 'hora_inicio', 'hora_fin', 'observaciones'
        ]

    def get_realizada_por_nombre(self, obj):
        return obj.realizada_por.nombre if obj.realizada_por else None


class LimpiezahabitacionCreateSerializer(serializers.ModelSerializer):
    """Para crear registros de limpieza"""
    class Meta:
        model = Limpiezahabitacion
        fields = ['habitacion', 'realizada_por', 'fecha_limpieza', 'hora_inicio', 'hora_fin', 'observaciones']


class MantenimientohabitacionSerializer(serializers.ModelSerializer):
    realizado_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Mantenimientohabitacion
        fields = [
            'mantenimiento_id', 'habitacion', 'realizado_por', 'realizado_por_nombre',
            'tipo', 'descripcion', 'fecha_solicitud', 'fecha_realizacion', 'completado'
        ]

    def get_realizado_por_nombre(self, obj):
        return obj.realizado_por.nombre if obj.realizado_por else None


class MantenimientohabitacionCreateSerializer(serializers.ModelSerializer):
    """Para crear solicitudes de mantenimiento"""
    class Meta:
        model = Mantenimientohabitacion
        fields = ['habitacion', 'tipo', 'descripcion', 'fecha_solicitud']


class HabitacionDetailSerializer(serializers.ModelSerializer):
    """Detalle completo de una habitación con sus relaciones"""
    tipo_habitacion_info = TipohabitacionSerializer(source='tipo_habitacion', read_only=True)
    estado_habitacion_info = EstadohabitacionSerializer(source='estado_habitacion', read_only=True)
    limpiezas = LimpiezahabitacionSerializer(many=True, read_only=True)
    mantenimientos = MantenimientohabitacionSerializer(many=True, read_only=True)

    class Meta:
        model = Habitacion
        fields = [
            'habitacion_id', 'numero', 'tipo_habitacion', 'tipo_habitacion_info',
            'estado_habitacion', 'estado_habitacion_info', 'descripcion', 'capacidad',
            'url_camara', 'activa', 'limpiezas', 'mantenimientos'
        ]


class HabitacionListSerializer(serializers.ModelSerializer):
    """Lista simple de habitaciones"""
    tipo_habitacion_nombre = serializers.CharField(source='tipo_habitacion.nombre', read_only=True)
    estado_habitacion_nombre = serializers.CharField(source='estado_habitacion.nombre', read_only=True)

    class Meta:
        model = Habitacion
        fields = [
            'habitacion_id', 'numero', 'tipo_habitacion', 'tipo_habitacion_nombre',
            'estado_habitacion', 'estado_habitacion_nombre', 'capacidad', 'activa'
        ]


class HabitacionCreateUpdateSerializer(serializers.ModelSerializer):
    """Para crear y actualizar habitaciones"""
    class Meta:
        model = Habitacion
        fields = [
            'tipo_habitacion', 'estado_habitacion', 'numero', 'descripcion',
            'capacidad', 'url_camara', 'activa'
        ]
