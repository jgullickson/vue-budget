const sampleData = {
    sample_income: [
        {
            amount:1201.38,
            category:"Paycheck",
            date:"2020-04-21",
            id:1,
            title:"Paycheck",
            type:"income",
        },
        {
            amount:50.00,
            category:"Other",
            date:"2020-01-15",
            id:2,
            title:"Gift",
            type:"income",
        },
        {
            amount:320,
            category:"Other",
            date:"2020-02-14",
            id:3,
            title:"Dividend",
            type:"income",
        },
        {
            amount:1201.72,
            category:"Paycheck",
            date:"2020-05-02",
            id:4,
            title:"Paycheck",
            type:"income",
        }
    ],
    sample_expenses: [
        {
            amount:121.80,
            category:"Food",
            date:"2020-04-10",
            id: 5,
            title:"Groceries",
            type:"expense",
        },
        {
            amount:45.00,
            category:"Other",
            date:"2020-01-01",
            id:6,
            title:"Internet",
            type:"expense",
        },
        {
            amount: 38.92,
            category:"Auto",
            date:"2020-02-14",
            id:7,
            title:"Gas",
            type:"expense",
        },
        {
            amount:25,
            category:"Entertainment",
            date:"2020-03-25",
            id:8,
            title:"Movie",
            type:"expense",
        }
    ]
};

Vue.component('banner', {
    props: {
        greeting: {
            type: String,
            required: true,
            default: 'Welcome'
        },
        icon: {
            type: String
        }
    },
    template: `
    <div class='banner'>
        <img :src='icon' alt='logo'>
        <h1>{{greeting}}</h1>
    </div>
    `
});

Vue.component('record-logger', {
    props: {
        income_categories: {
            type: Array,
            required: true
        },
        expense_categories: {
            type: Array,
            required: true
        }
    },
    data(){
        return {

            mode: 'income',

            title: null,
            amount: null,
            category: null,
            date: null,

            validateErrors: {
                title: false,
                amount: false,
                category: false,
                date: false,
            }
        }
    },
    computed: {
        active_mode(){
            return this.mode === 'expense' ? 'expense' : 'income';
        },
        inactive_mode(){
            return this.mode === 'expense' ? 'income' : 'expense';
        },
        active_categories(){
            if (this.mode === 'expense'){
                return this.expense_categories;
            } else if (this.mode === 'income'){
                return this.income_categories;
            }
        }
    },
    methods: {
        setMode(mode){
            this.mode = mode;
        },
        handleSubmit(){

            for (error in this.validateErrors){
                this.validateErrors[error] = false;
            };

            let dateStamp = Date.now();

            let record = {
                title: this.title,
                amount: parseFloat(this.amount),
                category: this.category,
                date: this.date,
                id: dateStamp,
                type: this.mode
            };

            let allComplete = Object.values(record).indexOf(null) === -1;

            if (allComplete) {

                if (this.mode === 'expense'){
                    this.$emit('add-expense', record);
                } else if (this.mode === 'income'){
                    this.$emit('add-income', record)
                }

                this.title = null;
                this.amount = null;
                this.category = null;
                this.date = null;

            } else {
                for (field in record){
                    if (record[field] === null){
                        this.validateErrors[field] = true;
                    }
                }
            }
        }
    },
    template: `
        <div class='record-logger'>

            <div class='mode-btn-row'>
                <div><span>New</span></div>
                <button @click='setMode("expense")' :class='["mode-btn", mode === "expense" ? "mode-btn-active" : "mode-btn-inactive"]'>Expense</button>
                <button @click='setMode("income")' :class='["mode-btn", mode === "income" ? "mode-btn-active" : "mode-btn-inactive"]'>Income</button>
            </div>

            <form v-on:submit.prevent='handleSubmit'>
                
                <label for='date'>Date</label>
                <input
                    :class='validateErrors.date ? "red-border" : "" '
                    id='date'
                    type='date'
                    v-model='date'>
                </input>

                <label for='title'>Title</label>
                <input
                    :class='validateErrors.title ? "red-border" : "" '
                    id='title'
                    v-model='title'
                    placeholder='Title'>
                </input>

                <label for='amount'>Amount</label>
                <input
                    :class='validateErrors.amount ? "red-border" : "" '
                    id='amount'
                    type='number'
                    step='any'
                    min='0'
                    v-model='amount'
                    placeholder=0.00>
                </input>

                <label for='category'>Category</label>
                <select
                    :class='validateErrors.category ? "red-border" : "" '
                    id='category'
                    v-model='category'>
                    <option v-for='category in active_categories'>{{category}}</option>
                </select>
                
                <button
                    class='record-submit-btn'
                    type='submit'>
                    Submit
                </button>
            </form>
        </div>    
    `
});

Vue.component('record', {
    props: {
        record: {
            type: Object,
            required: true
        }
    },
    data(){
        return {
            collapsed: true
        }
    },
    computed: {
        recordData(){
            return {...this.record}
        },
        isCollapsed(){
            return this.collapsed ? true : false;
        },
        icon(){
            switch(this.recordData.category){
                case 'Home':
                    return './icons/home.svg';
                case 'Food':
                    return './icons/fast-food.svg';
                case 'Auto':
                    return './icons/car.svg';
                case 'Entertainment':
                    return './icons/entertainment.svg';
                case 'Paycheck':
                    return './icons/paycheck.svg';
                default:
                    return './icons/dollaricon.svg';
            }
        }
    },
    methods: {
        toggleCollapsed(){
            this.collapsed = !this.collapsed;
        },
        deleteRecord(){
            this.toggleCollapsed();
            this.$emit('send-record-for-delete', this.recordData)
        },
        updateRecord(){
            this.toggleCollapsed();
            let updatedRecord = {...this.recordData, amount: parseFloat(this.recordData.amount)};
            this.$emit('send-record-for-update', updatedRecord);
        }
    },
    template: `

    <div v-if='isCollapsed' class='record' @click='toggleCollapsed'>

        <div class='record-date'><span>{{record.date}}</span></div>
        <div :class='["record-amount", record.type === "income" ? "record-amount-income" : record.type === "expense" ? "record-amount-expense" : ""]'><span>{{record.amount.toFixed(2)}}</span></div>
        <div class='record-title'><span>{{record.title}}</span><img class='record-icon' :src='this.icon'></div>

    </div>

    <div v-else-if='!isCollapsed' class='record-expanded'>

        <input type='text' v-model='recordData.title'></input>
        <input type='date' v-model='recordData.date'></input>
        <input type='number' step='any' min='0' v-model='recordData.amount'></input>

        <div class='btn-row'>
            <button class='collapse-btn' @click='toggleCollapsed'>Back</button>
            <button class='update-btn' @click='updateRecord'>Save</button>
            <button class='delete-btn' @click='deleteRecord'>Delete</button>
        </div>

    </div>
    `
})

Vue.component('record-list', {
    props: {
        expenses: {
            type: Array,
            required: true
        },
        income: {
            type: Array,
            required: true
        }
    },
    computed: {
        sorted(){
            // display most recent transactions at top of list
            let allRecords = [...this.expenses, ...this.income];
            // console.log(allRecords);
            return allRecords.sort((a,b) => new Date(b.date) - new Date(a.date))
        }
    },
    methods: {
        requestDeleteFromRoot(record){
            this.$emit('delete-request', record);
        },
        requestUpdateFromRoot(record){
            this.$emit('update-request', record);
        }
    },
    template: `
        <div class='record-list'>
      
                <record
                    @send-record-for-delete='requestDeleteFromRoot'
                    @send-record-for-update='requestUpdateFromRoot'
                    v-for='(record, index) in sorted'
                    :key='index'
                    :record='record'
                ></record>     
        </div>    
    `
})

Vue.component('stats', {
    props: {
        expenses: {
            type: Array,
            required: true
        },
        income: {
            type: Array,
            required: true
        }
    },
    computed: {
        totalOut(){
            return this.expenses.reduce((a,c) => a + c.amount, 0);
        },
        totalIn(){
            return this.income.reduce((a,c) => a + c.amount, 0);
        },
        net(){
            return this.totalIn - this.totalOut;
        }
    },
    template: `
        <div class='stats-container'>
            <div class='stats-totals'>
                <div><span class='stats-title'>Income:</span><span class='stats-val green-text'>{{this.totalIn.toFixed(2)}}</span></div>
                <div><span class='stats-title'>Expenses:</span><span class='stats-val red-text'>{{this.totalOut.toFixed(2)}}</span></div>
                <div class='divider'></div>
                <div><span class='stats-title'>Net:</span><span :class='["stats-val", this.net < 0 ? "red-text" : this.net > 0 ? "green-text" : ""]'>{{this.net.toFixed(2)}}</span></div>    
            </div>
        </div>`
})

const vm = new Vue({
    el: '#root',
    data: {
        greeting: 'clear',
        iconpath: './favicons/favicon-32x32.png',
        income_categories: [
            'Paycheck',
            'Other'
        ],
        expense_categories: [
            'Food',
            'Home',
            'Entertainment',
            'Auto',
            'Other'
        ],
        expenses: [...sampleData.sample_expenses],
        income: [...sampleData.sample_income]
    },
    methods: {
        addExpense(e){
            console.log('adding expense')
            this.expenses.push(e)
        },
        addIncome(i){
            console.log('adding income')
            this.income.push(i)
        },
        deleteRecordById(record){
            if (record.type === 'expense'){
                this.expenses = this.expenses.filter(e => e.id !== record.id);
            } else if (record.type === 'income'){
                this.income = this.income.filter(i => i.id !== record.id);
            }
        },
        updateRecordById(record){

            if (record.type === 'expense'){

                let index = this.expenses.findIndex(e => e.id === record.id);

                //this.expenses[index] = record; <-- doesn't trigger reactivity system
                Vue.set(this.expenses, index, record); // <-- works!

            } else if (record.type === 'income'){

                let index = this.income.findIndex(i => i.id === record.id);

                //this.income[index] = record; <-- doesn't trigger reactivity system
                Vue.set(this.income, index, record); // <-- works!

            }
        }
    },
    template: `
        <div>

            <banner
                :icon='iconpath'
                :greeting='greeting'></banner>
            <div class='main-grid'>

            <record-logger
                @add-income='addIncome'
                @add-expense='addExpense'
                :income_categories='income_categories'
                :expense_categories='expense_categories'
            ></record-logger>

            <record-list
                @delete-request='deleteRecordById'
                @update-request='updateRecordById'
                :income = 'income'
                :expenses='expenses'>
            </record-list>

            <stats 
                :income='income'
                :expenses='expenses'>
            </stats>

            </div>
        </div>
    `
})