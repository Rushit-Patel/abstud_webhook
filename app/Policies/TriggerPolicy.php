<?php
// app/Policies/TriggerPolicy.php

namespace App\Policies;

use App\Models\User;
use App\Models\Trigger;

class TriggerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Trigger $trigger): bool
    {
        return $user->id === $trigger->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Trigger $trigger): bool
    {
        return $user->id === $trigger->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Trigger $trigger): bool
    {
        return $user->id === $trigger->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Trigger $trigger): bool
    {
        return $user->id === $trigger->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Trigger $trigger): bool
    {
        return $user->id === $trigger->user_id;
    }
}