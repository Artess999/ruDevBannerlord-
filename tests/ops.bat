@echo on
@echo Start %time%
@timeout /T 1 /NOBREAK > NUL
@MD "%CD%\ops_Languages\Native\"
@MD "%CD%\ops_Languages\SandBox\"
@MD "%CD%\ops_Languages\SandBoxCore\"
@MD "%CD%\ops_Languages\StoryMode\"
@color 2a
copy "%CD%/Modules/Native/ModuleData/Languages/" "%CD%\ops_Languages\Native\"
copy "%CD%/Modules/SandBox/ModuleData/Languages/" "%CD%\ops_Languages\SandBox\"
copy "%CD%/Modules/SandBoxCore/ModuleData/Languages/" "%CD%\ops_Languages\SandBoxCore\"
copy "%CD%/Modules/StoryMode/ModuleData/Languages/" "%CD%\ops_Languages\StoryMode\"
@echo Stop %time%
@color 0a
@echo       #################
@echo       # by DOG729.RU  #
@echo       #################
@timeout /T 4 /NOBREAK > NUL