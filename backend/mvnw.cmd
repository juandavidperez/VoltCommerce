@REM Maven Wrapper for Windows
@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
set MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties

if exist "%MAVEN_WRAPPER_PROPERTIES%" (
    for /f "tokens=1,* delims==" %%a in ('findstr "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do set DISTRIBUTION_URL=%%b
    for /f "tokens=1,* delims==" %%a in ('findstr "wrapperUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do set MAVEN_WRAPPER_URL=%%b
)

if not defined DISTRIBUTION_URL set DISTRIBUTION_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
if not defined MAVEN_WRAPPER_URL set MAVEN_WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_WRAPPER_URL%' -OutFile '%MAVEN_WRAPPER_JAR%'"
)

if defined JAVA_HOME (
    set JAVACMD=%JAVA_HOME%\bin\java.exe
) else (
    set JAVACMD=java.exe
)

"%JAVACMD%" %MAVEN_OPTS% -jar "%MAVEN_WRAPPER_JAR%" "-DdistributionUrl=%DISTRIBUTION_URL%" %*
