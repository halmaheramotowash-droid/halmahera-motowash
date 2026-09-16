@echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_HOME=%DIRNAME%

if exist "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" goto execute

echo ERROR: Gradle wrapper JAR not found.
exit /b 1

:execute
java -classpath "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*