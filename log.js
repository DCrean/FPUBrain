module.exports = function (message, error=true){
	let prefix = (error ? "[ERROR]" : "[INFO]") + ": ";
	console.log(prefix + message);
}