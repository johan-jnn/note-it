<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, classesApi, type Class } from '$lib/api';

  let items = $state<Class[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await classesApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des classes';
    } finally {
      loading = false;
    }
  }

  function openItem(id: number) {
    goto(`/classes/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Classes</h1>
  <a class="button" href="/classes/new">+ Ajouter</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucune classe pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Créée le</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{new Date(item.created_at).toLocaleDateString()}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
