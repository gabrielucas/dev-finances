// criando funcionalidade para o modal
const Modal = {
    toggle: () => {
      // abrir/fechar o modal
      // adicionar/remover a class 'active' do modal
      document
        .querySelector('.modal-overlay')
        .classList
        .toggle('active')
    }
  }

const Storage = {
    get: () => {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set: transactions => {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    // adicionar uma transação
    add: transaction => {
        Transaction.all.push(transaction)
        console.log(Transaction.all)
        App.reload()
    },

    // remover uma transação
    remove: index => {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    // somar as entradas
    incomes: () => {
        // variável de armazenamento da soma das entradas
        let income = 0
        
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income;
    },
    
    // somar as saídas
    expenses: () => {
        // variável de armazenamento da soma das entradas
        let expense = 0
        
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense;
    },

    // entradas + saídas
    total: () => {
        return Transaction.incomes() + Transaction.expenses();
        
    }

}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    showTransaction: (transaction, index) => {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction: (transaction, index) => {

        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrencyBRL(transaction.amount)
        const date = Utils.formatDateToShow(transaction.date)        

        const html = `        
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Botão de remoção de transação">
            </td>`

        return html
    },

    updateBalance: () => {
        document
            .getElementById('income-display')
            .innerHTML = Utils.formatCurrencyBRL(Transaction.incomes())

        document
            .getElementById('expense-display')
            .innerHTML = Utils.formatCurrencyBRL(Transaction.expenses())

        document
            .getElementById('total-display')
            .innerHTML = Utils.formatCurrencyBRL(Transaction.total())
    },

    clearTransactions: () => {
        DOM.transactionsContainer.innerHTML = ''
    }

}

const Utils = {
    formatCurrencyBRL: value => {
        return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
    },
    formatDateToShow: date => {
        return date.toLocaleDateString() || ''
    },
    formatAmount: value => {
        return Number(value)
    },
    formatDateToSave: date => {
        date = date.replace(/-/g, '/')

        hours = new Date().getHours()
        minutes = new Date().getMinutes()
        seconds = new Date().getSeconds()

        return new Date(`${date} ${hours}:${minutes}:${seconds}`) 
        
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues: () => {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields: () => {
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos.')
        }
    },

    formatData: () => {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDateToSave(date) 

        return {
            description,
            amount,
            date
        }

    },

    saveTransaction: (transaction) => {
        Transaction.add(transaction)
    },

    clearFields: () => {
        Form.description.value = ""
        Form.amount.value = "",
        Form.date.value = ""
    },

    submit: event => {
        // para o comportamento padrão de envio do formulário
        event.preventDefault()

        try{
            Form.validateFields()
            const transaction = Form.formatData()

            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.toggle()
        }
        catch(error){
            alert(error.message)
        }

        
    }

}

const App = {
    init: () => {

        Transaction.all.forEach(DOM.showTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)

    },

    reload: () => {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

