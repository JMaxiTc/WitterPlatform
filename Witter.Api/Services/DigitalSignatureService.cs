using System.Security.Cryptography;
using System.Text;

namespace Witter.Api.Services
{
    public class DigitalSignatureService
    {
        private readonly RSA _rsa;

        public DigitalSignatureService()
        {
            _rsa = RSA.Create();
            
            // Para propósitos de esta implementación, generaremos una llave temporal o en memoria
            // En un ambiente real, la llave privada debe guardarse en un Key Vault (como AWS KMS o Azure Key Vault)
            // y la llave pública debe estar disponible para que terceros verifiquen.
            
            // Alternativamente, puedes cargar desde un archivo, pero como no existe configuramos una llave nueva por sesión
        }

        // Exportar la llave pública para que alguien más pueda verificar
        public string GetPublicKey()
        {
            return Convert.ToBase64String(_rsa.ExportRSAPublicKey());
        }

        // Importar llave privada si se deseara persistencia
        public void ImportPrivateKey(string base64PrivateKey)
        {
            _rsa.ImportRSAPrivateKey(Convert.FromBase64String(base64PrivateKey), out _);
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