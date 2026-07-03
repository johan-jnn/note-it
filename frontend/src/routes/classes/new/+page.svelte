<script lang="ts">
  import { goto } from '$app/navigation';
  import { ApiError, classesApi } from '$lib/api';

  let name = $state('');
  let saving = $state(false);
  let error = $state('');

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      const created = await classesApi.create({ name });
      goto(`/classes/${created.id}`);
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création de la classe';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/classes">&larr; Retour aux classes</a>
<h1>Nouvelle classe</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="name">Nom</label>
    <input id="name" type="text" bind:value={name} required />
  </div>

  <div class="form-actions">
    <button class="button" type="submit" disabled={saving}>
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
