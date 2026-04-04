from usuarios.models import Usuario


def get_usuario_session(request):
    """
    Obtiene el usuario de la sesión.
    Retorna la instancia del Usuario o None si no está autenticado.
    """
    usuario_id = request.session.get('usuario_id')
    if not usuario_id:
        return None
    
    try:
        return Usuario.objects.get(usuario_id=usuario_id)
    except Usuario.DoesNotExist:
        return None


def is_admin(usuario):
    """
    Verifica si un usuario tiene rol de administrador.
    """
    if not usuario:
        return False
    return usuario.rol == 'Administrador'


def is_due(usuario):
    """
    Verifica si un usuario tiene rol de dueño (de mascotas).
    """
    if not usuario:
        return False
    return usuario.rol == 'Dueño'


def is_especialista(usuario):
    """
    Verifica si un usuario tiene rol de especialista.
    """
    if not usuario:
        return False
    return usuario.rol == 'Especialista'


def is_personal_limpieza(usuario):
    """
    Verifica si un usuario es personal de limpieza.
    """
    if not usuario:
        return False
    return usuario.rol == 'Personal limpieza'
