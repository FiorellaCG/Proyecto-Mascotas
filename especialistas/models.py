from django.db import models
from usuarios.models import Usuario


class Turno(models.Model):
    turno_id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50, db_collation='Modern_Spanish_CI_AI')
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    descripcion = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Turno'

    def __str__(self):
        return f'{self.nombre} ({self.hora_inicio} - {self.hora_fin})'


class Especialista(models.Model):
    especialista_id = models.AutoField(primary_key=True)
    usuario = models.OneToOneField(
        Usuario, models.DO_NOTHING,
        related_name='especialista_perfil'
    )
    turno = models.ForeignKey(
        Turno, models.DO_NOTHING,
        related_name='especialistas'
    )
    especialidad = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AI', blank=True, null=True)
    fecha_ingreso = models.DateField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'Especialista'

    def __str__(self):
        return f'{self.usuario.nombre} {self.usuario.apellidos}'