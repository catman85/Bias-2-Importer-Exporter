<template>
    <div>
        <b-jumbotron header="Info" lead="This app was made with electron-vue">
            <p><img class="logo" src="@/assets/logo.png" alt=""></p>
            <p>Get the source <a ref="gitLink" href="https://github.com/catman85/Bias-2-Importer-Exporter" target="_blank" @click.prevent="openLinkInDefaultBrowser($refs.gitLink.href)">here.</a></p>
            <p>Donate by downloading this app from here: <a href="">link1</a> <a href="">link2</a></p>
            <p>More information on application's state.</p>
            <b-button v-b-toggle.collapse-1 variant="primary">Show Info</b-button>
            <b-collapse id="collapse-1" class="mt-2">
                <b-list-group>
                    <b-list-group-item> Is Positive Grid Folder set? {{isDirSet}}</b-list-group-item>
                    <b-list-group-item>is Positive Grid Folder good? {{checkMainDirectoryValidity}}</b-list-group-item>
                    <b-list-group-item>Positive Grid Path: {{positiveGridPath}}</b-list-group-item>
                    <div v-if="checkMainDirectoryValidity">
                        <b-list-group-item>Selected Bank Path: {{selectedBankPath}}</b-list-group-item>
                    </div>
                </b-list-group>
            </b-collapse>
        </b-jumbotron>
        <system-information></system-information>
    </div>
</template>

<script>
    import SystemInformation from '@/components/SystemInformation.vue'
    export default {
        components: {
            SystemInformation
        }
    }
</script>

<style>

</style>