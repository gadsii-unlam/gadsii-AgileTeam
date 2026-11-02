(function () {
  var check = document.getElementById('mostrar-password');
  var password = document.getElementById('password');
  if (!check || !password) return;
  check.addEventListener('change', function () {
    password.type = check.checked ? 'text' : 'password';
  });
})();
