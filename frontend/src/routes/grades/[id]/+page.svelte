<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { ApiError, assignmentsApi, gradesApi, type Assignment, type Grade } from '$lib/api';

  const id = Number(page.params.id);

  let item = $state<Grade | null>(null);
  let value = $state<number | null>(null);
  let comment = $state('');
  let assignmentId = $state<number | null>(null);
  let studentId = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  let assignments = $state<Assignment[]>([]);

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      [item, assignments] = await Promise.all([gradesApi.get(id), assignmentsApi.list()]);
      value = item.value;
      comment = item.comment ?? '';
      assignmentId = item.assignment.id;
      studentId = item.student.id;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement de la note';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      item = await gradesApi.update(id, {
        value: value ?? 0,
        comment: comment || undefined,
        assignmentId: assignmentId ?? undefined,
        studentId: studentId || undefined,
      });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour de la note';
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm('Supprimer cette note ?')) return;
    try {
      await gradesApi.remove(id);
      goto('/grades');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la suppression de la note';
    }
  }
</script>

<a class="back-link" href="/grades">&larr; Retour aux notes</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>Note n°{item.id}</h1>

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
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button class="button danger" type="button" onclick={remove}>Supprimer</button>
    </div>
  </form>

  <p class="meta">
    Devoir : {item.assignment.title} · Élève : {item.student.first_name}
    {item.student.last_name}
  </p>

  <p class="meta">
    Créée le {new Date(item.created_at).toLocaleString()} · Modifiée le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
