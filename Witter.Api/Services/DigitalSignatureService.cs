using System.Security.Cryptography;
using System.Text;

namespace Witter.Api.Services
{
    public class DigitalSignatureService
    {
        private readonly RSA _rsa;

        public DigitalSignatureService(IConfiguration configuration)
        {
            _rsa = RSA.Create();
            // Busca la variable de entorno en la nube, o una llave de pruebas si estás en local
            string? rsaKeyXml = configuration["RSAPrivateKey"];
            
            if (string.IsNullOrEmpty(rsaKeyXml))
            {
                // Solo para desarrollo si no has configurado la variable
                rsaKeyXml = _rsa.ToXmlString(true); 
            }
            
            // Importa la llave persistente
            _rsa.FromXmlString(rsaKeyXml); 
        }

        // Exportar la llave pública para que alguien más pueda verificar
        public string GetPublicKey()
        {
            return Convert.ToBase64String(_rsa.ExportRSAPublicKey());
        }

        public string SignData(string dataToSign)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(dataToSign);
            byte[] signatureBytes = _rsa.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            
            return Convert.ToBase64String(signatureBytes);
        }

        public bool VerifySignature(string originalData, string base64Signature)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(originalData);
            byte[] signatureBytes = Convert.FromBase64String(base64Signature);
            
            return _rsa.VerifyData(dataBytes, signatureBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        }
    }
}