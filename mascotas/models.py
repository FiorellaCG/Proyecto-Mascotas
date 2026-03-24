from django.db import models
from usuarios.models import Usuario
from especialistas.models import Especialista


class Nivelasistencia(models.Model):
    nivel_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=80, db_collation='Modern_Spanish_CI_AI')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'NivelAsistencia'

    def __str__(self):
        return self.nombre


class Tipocuidadoespecial(models.Model):
    tipo_cuidado_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=80, db_collation='Modern_Spanish_CI_AI')

    class Meta:
        managed = False
        db_table = 'TipoCuidadoEspecial'

    def __str__(self):
        return self.nombre


class Mascota(models.Model):
    mascota_id = models.AutoField(primary_key=True)
    dueno_usuario = models.ForeignKey(
        Usuario, models.DO_NOTHING,
        related_name='mascotas_como_dueno'
    )
    especialista = models.ForeignKey(
        Especialista, models.DO_NOTHING,
        related_name='mascotas_asignadas',
        blank=True, null=True
    )
    nivel_asistencia = models.ForeignKey(
        Nivelasistencia, models.DO_NOTHING,
        related_name='mascotas'
    )
    nombre = models.CharField(max_length=80, db_collation='Modern_Spanish_CI_AI')
    especie = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    raza = models.CharField(max_length=80, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    fecha_ingreso_sys = models.DateTimeField()
    aprobada = models.BooleanField(blank=True, null=True)
    aprobada_por = models.ForeignKey(
        Usuario, models.DO_NOTHING,
        db_column='aprobada_por',
        related_name='mascotas_aprobadas',
        blank=True, null=True
    )
    fecha_aprobacion = models.DateTimeField(blank=True, null=True)
    observaciones = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    activa = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'Mascota'

    def __str__(self):
        return f'{self.nombre} ({self.especie})'


class Mascotacuidadoespecial(models.Model):
    cuidado_mascota_id = models.AutoField(primary_key=True)
    mascota = models.ForeignKey(
        Mascota, models.DO_NOTHING,
        related_name='cuidados_especiales'
    )
    tipo_cuidado = models.ForeignKey(
        Tipocuidadoespecial, models.DO_NOTHING,
        related_name='cuidados_mascota'
    )
    descripcion = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AI')
    fecha_registro = models.DateTimeField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'MascotaCuidadoEspecial'

    def __str__(self):
        return f'{self.tipo_cuidado.nombre} — {self.mascota.nombre}'