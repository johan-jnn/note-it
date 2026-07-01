<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, assignmentsApi, lessonsApi, type Lesson } from '$lib/api';

  let title = $state('');
  let scale = $state<number | null>(null);
  let coefficient = $state<number | null>(null);
  let begin_date = $state('');
  let end_date = $state('');
  let lessonId = $state<number | null>(null);
  let saving = $state(false);
  let error = $state('');

  let lessons = $state<Lesson[]>([]);

  onMount(async () => {
    try {
      lessons = await lessonsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des cours';
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      const created = await assignmentsApi.create({
        title,
        scale: scale ?? 0,
        coefficient: coefficient ?? undefined,
        begin_date: begin_date || undefined,
        end_date: end_date || undefined,
        lessonId: lessonId ?? 0,
      });
      goto(`/assignments/${created.id}`);
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création du devoir';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/assignments">&larr; Retour aux devoirs</a>
<h1>Nouveau devoir</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="title">Titre</label>
    <input id="title" type="text" bind:value={title} required />
  </div>

  <div class="field">
    <label for="scale">Barème</label>
    <input id="scale" type="number" min="0" bind:value={scale} required />
  </div>

  <div class="field">
    <label for="coefficient">Coefficient (par défaut 1)</label>
    <input id="coefficient" type="number" step="0.01" bind:value={coefficient} />
  </div>

  <div class="field">
    <label for="begin_date">Date de début</label>
    <input id="begin_date" type="date" bind:value={begin_date} />
  </div>

  <div class="field">
    <label for="end_date">Date de fin</label>
    <input id="end_date" type="date" bind:value={end_date} />
  </div>

  <div class="field">
    <label for="lessonId">Cours</label>
    <select id="lessonId" bind:value={lessonId} required>
      <option value={null} disabled selected>Sélectionner un cours</option>
      {#each lessons as l (l.id)}
        <option value={l.id}>{l.real_name}</option>
      {/each}
    </select>
  </div>

  <div class="form-actions">
    <button class="button" type="submit" disabled={saving}>
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
