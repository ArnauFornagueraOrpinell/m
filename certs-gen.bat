@echo off
setlocal enabledelayedexpansion

REM Definir rutas
set "OPENSSL_PATH=C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
set "CERT_PATH=%cd%\certs"
set "CLI_PATH=%cd%\madersenia_cli\certs"
set "API_PATH=%cd%\madersenia_api\certs"

REM Crear directorios si no existen
if not exist "%CERT_PATH%" mkdir "%CERT_PATH%"
if not exist "%CLI_PATH%" mkdir "%CLI_PATH%"
if not exist "%API_PATH%" mkdir "%API_PATH%"

REM Generar certificado autofirmado
echo Generando certificado autofirmado...
"%OPENSSL_PATH%" req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "%CERT_PATH%\server.key" -out "%CERT_PATH%\server.crt" -subj "/C=US/ST=State/L=City/O=Organization/OU=Org Unit/CN=localhost"

REM Verificar si la generación fue exitosa
if %errorlevel% neq 0 (
    echo Error al generar el certificado.
    exit /b 1
)

REM Copiar certificados a CLI y API
echo Copiando certificados a CLI y API...
copy "%CERT_PATH%\server.key" "%CLI_PATH%\server.key"
copy "%CERT_PATH%\server.crt" "%CLI_PATH%\server.crt"
copy "%CERT_PATH%\server.key" "%API_PATH%\server.key"
copy "%CERT_PATH%\server.crt" "%API_PATH%\server.crt"

REM Verificar si las copias fueron exitosas
if %errorlevel% neq 0 (
    echo Error al copiar los certificados.
    exit /b 1
)

echo Certificados generados y copiados exitosamente.
echo Ubicaciones:
echo   - Original: %CERT_PATH%
echo   - CLI: %CLI_PATH%
echo   - API: %API_PATH%

pause