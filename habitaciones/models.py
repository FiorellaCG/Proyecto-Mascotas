from django.db import models
from usuarios.models import Usuario


class Tipohabitacion(models.Model):
    tipo_habitacion_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=80, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    tiene_camara = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'TipoHabitacion'

    def __str__(self):
        return self.nombre


class Estadohabitacion(models.Model):
    estado_habitacion_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'EstadoHabitacion'

    def __str__(self):
        return self.nombre


class Habitacion(models.Model):
    habitacion_id = models.AutoField(primary_key=True)
    tipo_habitacion = models.ForeignKey(
        Tipohabitacion, models.DO_NOTHING,
        related_name='habitaciones'
    )
    estado_habitacion = models.ForeignKey(
        Estadohabitacion, models.DO_NOTHING,
        related_name='habitaciones_por_estado'
    )
    numero = models.CharField(unique=True, max_length=10, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    capacidad = models.SmallIntegerField()
    url_camara = models.CharField(max_length=300, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    activa = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'Habitacion'

    def __str__(self):
        return f'Hab. {self.numero} — {self.tipo_habitacion.nombre}'


class Limpiezahabitacion(models.Model):
    limpieza_id = models.AutoField(primary_key=True)
    habitacion = models.ForeignKey(
        Habitacion, models.DO_NOTHING,
        related_name='limpiezas'
    )
    realizada_por = models.ForeignKey(
        Usuario, models.DO_NOTHING,
        db_column='realizada_por',
        related_name='limpiezas_realizadas'
    )
    fecha_limpieza = models.DateField()
    hora_inicio = models.TimeField(blank=True, null=True)
    hora_fin = models.TimeField(blank=True, null=True)
    observaciones = models.CharField(max_length=400, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'LimpiezaHabitacion'

    def __str__(self):
        return f'Limpieza {self.habitacion.numero} — {self.fecha_limpieza}'


class Mantenimientohabitacion(models.Model):
    mantenimiento_id = models.AutoField(primary_key=True)
    habitacion = models.ForeignKey(
        Habitacion, models.DO_NOTHING,
        related_name='mantenimientos'
    )
    realizado_por = models.ForeignKey(
        Usuario, models.DO_NOTHING,
        db_column='realizado_por',
        related_name='mantenimientos_realizados',
        blank=True, null=True
    )
    tipo = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=600, db_collation='Modern_Spanish_CI_AI')
    fecha_solicitud = models.DateField()
    fecha_realizacion = models.DateField(blank=True, null=True)
    completado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'MantenimientoHabitacion'

    def __str__(self):
        return f'{self.tipo} — Hab. {self.habitacion.numero}'