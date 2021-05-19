function validatePsswod() {
    var x = document.getElementById('password').nodeValue;
    errors = [];
    if (x.length < 8) {
        errors.push("uw wachtwoord moet minstens 8 karakters lang zijn.")
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("uw wachtwoord moet 1 of meerdere letters bevatten.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("uw password moet minstens 1 cijfer bevatten."); 
    }
    if (errors.length > 0) {
        alert(errors.join("\n"));
        return false;
    }
    return true;
}