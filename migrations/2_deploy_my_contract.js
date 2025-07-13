// AQUI PONGO MI CONFIGURACION PARA EL DESPLIEGUE

const ApuestasDistribuidas = artifacts.require("ApuestasDistribuidas");

module.exports = function (deployer) {
  
  const propietarioDeseado = "0x8C5698c75bA10f03ad998174F42eF686a0225677"; // Pongo mi primera cuenta de metamask
  const inicialEther = web3.utils.toWei("1.0", "ether"); // Le doy 1 que estoy generoso

  deployer.deploy(ApuestasDistribuidas, propietarioDeseado, { from: propietarioDeseado, value: inicialEther }).then(instance => {
      console.log("Contrato desplegado en:", instance.address); console.log("Propietario establecido en:", propietarioDeseado);});
};