<template>
    <q-page>
        <q-card class="q-pa-md">
            <q-card-section class="text-h6">
                ¡Hasta luego!
            </q-card-section>
        </q-card>
    </q-page>
</template>
<script setup>
    window.location.href = '/goodbye';
    window.close();
</script>