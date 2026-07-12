<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Licence\Verifier\Presets\Blade\Providers;

use Illuminate\Support\ServiceProvider;
use Simtabi\Laranail\Licence\Verifier\Presets\Blade\Presets\BladePresetDefinition;
use Simtabi\Laranail\Licence\Verifier\Presets\Presets\Contracts\PresetContributor;
use Simtabi\Laranail\Licence\Verifier\Presets\Presets\PresetDefinition;
use Simtabi\Laranail\Licence\Verifier\Presets\Presets\PresetRegistry;

/**
 * Registers the Blade preset's definition into the core registry so the
 * generator/install command can offer it. Ships no runtime UI of its own.
 */
final class BladeServiceProvider extends ServiceProvider implements PresetContributor
{
    public function boot(): void
    {
        $this->app->make(PresetRegistry::class)->register($this->presetDefinition());
    }

    public function presetDefinition(): PresetDefinition
    {
        return BladePresetDefinition::make(dirname(__DIR__, 2).'/stubs');
    }
}
