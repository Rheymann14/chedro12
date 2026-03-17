<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionContact extends Model
{
    use HasFactory;

    public const FIELD_NAMES = [
        'official_email',
        'facebook_page',
        'office_address',
        'director_name',
        'director_position',
        'director_office',
        'director_address',
    ];

    protected $fillable = self::FIELD_NAMES;

    public static function defaults(): array
    {
        return [
            'official_email' => 'chedro12@ched.gov.ph',
            'facebook_page' => 'N/A',
            'office_address' => 'Regional Center, Brgy. Carpenter Hill, Koronadal, Philippines',
            'director_name' => 'Rody P. Garcia, MDM, JD, EdD',
            'director_position' => 'Regional Director',
            'director_office' => 'CHED Region XII',
            'director_address' => 'Regional Center, Brgy. Carpenter Hill, Koronadal, Philippines',
        ];
    }

    public static function current(): self
    {
        return static::query()->first() ?? new static(static::defaults());
    }

    public static function singleton(): self
    {
        return static::query()->first() ?? static::query()->create(static::defaults());
    }

    public function toContactSettings(): array
    {
        return array_merge(
            static::defaults(),
            $this->only(self::FIELD_NAMES),
        );
    }
}
