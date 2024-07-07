import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
      this.update()
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => user.login !== entry.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.wrapper-search button')
    const searchInput = this.root.querySelector('.wrapper-search input')

    addButton.onclick = () => {
      this.addInputValue()
    }

    searchInput.onkeydown = (event) => {
      if (event.key === 'Enter') {
        this.addInputValue()
      }
    }
  }

  addInputValue() {
    const { value } = this.root.querySelector('.wrapper-search input')
    this.add(value)
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })

    this.checkUserLength()
    this.root.querySelector('.wrapper-search input').value = ""
    this.root.querySelector('.wrapper-search input').focus()
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="" />
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    return tr
  }

  removeAllTr() {
    const tbody = this.root.querySelector('table tbody')

    tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }

  checkUserLength() {
    if (this.entries.length === 0) {
      this.root.querySelector('.wrapper-table #wrapper-text-empty').classList.add('message-empty')
    } else {
      this.root.querySelector('.wrapper-table #wrapper-text-empty').classList.remove('message-empty')
    }
  }
}