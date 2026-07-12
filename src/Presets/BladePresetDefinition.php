<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Licence\Verifier\Presets\Blade\Presets;

use Simtabi\Laranail\Licence\Verifier\Presets\Presets\PresetDefinition;
use Simtabi\Laranail\Licence\Verifier\Presets\Themes\Theme;

/**
 * Factory for the Blade preset's {@see PresetDefinition}.
 */
final class BladePresetDefinition
{
    public static function make(string $stubsPath): PresetDefinition
    {
        return new PresetDefinition(
            key: 'blade',
            label: 'Blade + vanilla JS',
            supportedThemes: [Theme::TAILWIND, Theme::BOOTSTRAP, Theme::ALPINE, Theme::UNSTYLED, Theme::CUSTOM],
            defaultTheme: Theme::TAILWIND,
            stubsPath: $stubsPath,
            composerRequire: 'laranail/license-verifier-ui-blade',
            frameworkRequire: null,
            fileMap: [
                'scaffold/Provider.php.stub' => 'src/Providers/$PROVIDER_CLASS$.php',
                'scaffold/Http/Controllers/LicenseController.php.stub' => 'src/Http/Controllers/LicenseController.php',
                'scaffold/routes.web.php.stub' => 'routes/web.php',
                'scaffold/config.php.stub' => 'config/$CONFIG_KEY$.php',
            ],
        );
    }
}
