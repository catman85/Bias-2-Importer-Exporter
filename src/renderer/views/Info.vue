<template>
    <div>
        <b-jumbotron header="BootstrapVue" lead="Bootstrap v4 Components for Vue.js 2">
            <p>For more information visit website</p>
            <b-button v-b-toggle.collapse-1 variant="primary">Toggle Collapse</b-button>
            <br>
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