<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, assignmentsApi, gradesApi, type Assignment } from '$lib/api';

  let value = $state<number | null>(null);
  let comment = $state('');
  let assignmentId = $state<number | null>(null);
  let studentId = $state('');
  let saving = $state(false);
  let error = $state('');

  let assignments = $state<Assignment[]>([]);

  onMount(async () => {
    try {
      assignments = await assignmentsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des devoirs';
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      const created = await gradesApi.create({
        value: value ?? 0,
        comment: comment || undefined,
        assignmentId: assignmentId ?? 0,
        studentId,
      });
      goto(`/grades/${created.id}`);
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création de la note';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/grades">&larr; Retour aux notes</a>
<h1>Nouvelle note</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="value">Valeur</label>
    <input id="value" type="number" step="0.01" bind:value required />
  </div>

  <div class="field">
    <label for="comment">Commentaire</label>
    <textarea id="comment" bind:value={comment}></textarea>
  </div>

  <div class="field">
    <label for="assignmentId">Devoir</label>
    <select id="assignmentId" bind:value={assignmentId} required>
      <option value={null} disabled selected>Sélectionner un devoir</option>
      {#each assignments as a (a.id)}
        <option value={a.id}>{a.title}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="studentId">Élève (UUID)</label>
    <input id="studentId" type="text" bind:value={studentId} required />
  </div>

  <div class="form-actions">
    <button class="button" type="submit" disabled={saving}>
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
