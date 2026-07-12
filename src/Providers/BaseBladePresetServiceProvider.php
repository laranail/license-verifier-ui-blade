<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Licence\Verifier\Presets\Blade\Providers;

use Illuminate\Support\Facades\Route;
use Override;
use Simtabi\Laranail\Licence\Verifier\Presets\Providers\BasePresetServiceProvider;

/**
 * Family base for a generated Blade preset package. Adds gated route loading on
 * top of the core's config/view registration. The generated provider extends
 * this and supplies viewNamespace()/configKey().
 */
abstract class BaseBladePresetServiceProvider extends BasePresetServiceProvider
{
    #[Override]
    protected function bootPreset(): void
    {
        if (! config($this->configKey().'.routes.enabled', true)) {
            return;
        }

        $routes = $this->packagePath('routes/web.php');

        if (! is_file($routes)) {
            return;
        }

        Route::group([
            'prefix' => config($this->configKey().'.routes.prefix', 'license'),
            'as' => config($this->configKey().'.routes.name', 'license-verifier.'),
            'middleware' => config($this->configKey().'.routes.middleware', ['web']),
        ], fn () => $this->loadRoutesFrom($routes));
    }
}
