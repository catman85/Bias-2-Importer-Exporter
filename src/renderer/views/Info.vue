<template>
<div>

Is dir set? {{isDirSet}}<br>
    is dir legit? {{checkMainDirectoryValidity}}<br>
    Dir: {{positiveGridPath}}<br>
    <div v-if="checkMainDirectoryValidity">
      Selected Bank Path: {{selectedBankPath}}<br>
      Preset Json Path: {{presetJsonPath}}<br>
    </div>
    <system-information></system-information>
</div>  
</template>

<script>
import SystemInformation from '@/components/SystemInformation.vue'
export default {
    components:{
        SystemInformation
    }

}
</script>

<style>

</style>