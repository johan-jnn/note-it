<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, subjectsApi, type Subject } from '$lib/api';

  let items = $state<Subject[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await subjectsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des matières';
    } finally {
      loading = false;
    }
  }

  function openItem(id: number) {
    goto(`/subjects/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Matières</h1>
  <a class="button" href="/subjects/new">+ Ajouter</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucune matière pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{item.description ?? ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
