<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AccountsType, ApiError, accountsApi, type AccountWithProfile } from '$lib/api';

  let items = $state<AccountWithProfile[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await accountsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des comptes';
    } finally {
      loading = false;
    }
  }

  function typeLabel(type: AccountsType) {
    return type === AccountsType.Student ? 'Élève' : 'Enseignant';
  }

  function openItem(id: string) {
    goto(`/accounts/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Comptes</h1>
  <a class="button" href="/accounts/new">+ Créer un compte</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucun compte pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Type</th>
        <th>Email</th>
        <th>Créé le</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.profile?.first_name} {item.profile?.last_name}</td>
          <td>{typeLabel(item.type)}</td>
          <td>{item.email}</td>
          <td>{new Date(item.created_at).toLocaleDateString()}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
