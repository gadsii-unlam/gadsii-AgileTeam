// Al cambiar el día, muestra sólo los turnos con lugares libres de ese día (H4).
(function () {
  var datos = document.getElementById('datos-opciones');
  var fecha = document.getElementById('fecha');
  var hora = document.getElementById('hora');
  if (!datos || !fecha || !hora) return;
  var opciones = JSON.parse(datos.textContent);

  function textoLibres(n) {
    return n === 1 ? 'queda 1 lugar' : 'quedan ' + n + ' lugares';
  }

  fecha.addEventListener('change', function () {
    var elegida = opciones.find(function (o) { return o.fecha === fecha.value; });
    hora.innerHTML = '';
    var placeholder = new Option('Elegí un turno', '', true, true);
    placeholder.disabled = true;
    hora.add(placeholder);
    (elegida ? elegida.horas : []).forEach(function (h) {
      hora.add(new Option(h.hora + ' hs — ' + textoLibres(h.libres), h.hora));
    });
  });
})();
