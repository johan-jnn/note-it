<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, accountsApi, subjectsApi, type AccountWithProfile } from '$lib/api';

  let name = $state('');
  let description = $state('');
  let ownerId = $state('');
  let saving = $state(false);
  let error = $state('');

  let teachers = $state<AccountWithProfile[]>([]);

  onMount(async () => {
    try {
      teachers = await accountsApi.listTeachers();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des enseignants';
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      const created = await subjectsApi.create({
        name,
        description: description || undefined,
        ownerId,
      });
      goto(`/subjects/${created.id}`);
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création de la matière';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/subjects">&larr; Retour aux matières</a>
<h1>Nouvelle matière</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="name">Nom</label>
    <input id="name" type="text" bind:value={name} required />
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" bind:value={description}></textarea>
  </div>

  <div class="field">
    <label for="ownerId">Propriétaire</label>
    <select id="ownerId" bind:value={ownerId} required>
      <option value="" disabled selected>Sélectionner un enseignant</option>
      {#each teachers as t (t.id)}
        <option value={t.id}>{t.profile.first_name} {t.profile.last_name}</option>
      {/each}
    </select>
  </div>

  <div class="form-actions">
    <button class="button" type="submit" disabled={saving}>
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
