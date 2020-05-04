Vue.component('tab-manager', {

    data(){
        return {
            tabs: []
        }
    },

    template: `
    <div class='tab-manager'>

        <div class='tabs'>
            <ul>
                <li 
                    v-for='tab in tabs'
                    :class={'is-active': tab.isActive}>
                    <a :href='tab.href' @click='selectTab(tab)' >{{tab.name}}</a>
                </li>
            </ul>
        </div>

        <div class='tab-content'>
            <slot></slot>
        </div>

    </div>`,

    created(){
        this.tabs = this.$children;
    },

    methods: {
        selectTab(selectedTab){
            this.tabs.map(tab => {
                tab.isActive = (tab.name === selectedTab.name)
            })
        }
    }

})

Vue.component('tab', {

    props: {
        name: {
            type: String,
            required: true
        },
        selected: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        href(){
            return `#${this.name.toLowerCase().replace(/ /g, '-')}`;
        }
    },

    template: `
        <div v-show='isActive'>
            <slot></slot>
        </div>`,

    data(){
        return {
            isActive: false
        }
    },

    mounted(){
        this.isActive = this.selected;
    }

})