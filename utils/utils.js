function maskInput(input) {
    if (input.length <= 8) {
        return input;
    }
    const firstPart = input.slice(0, 3);
    const lastPart = input.slice(-5);
    const maskedPart = '*'.repeat(input.length - 8);
    return firstPart + maskedPart + lastPart;
}

module.exports = { maskInput };