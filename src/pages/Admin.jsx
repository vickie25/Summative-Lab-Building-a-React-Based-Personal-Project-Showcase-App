import React, { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://localhost:3001'

const emptyProduct = {
  name: '',
  dsc: '',
  price: '',
  rate: '',
  country: '',
  img: '',
}

const emptyCustomer = {
  name: '',
  email: '',
  phone: '',
  location: '',
  status: 'Active',
}

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activeSection, setActiveSection] = useState('products')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [customerForm, setCustomerForm] = useState(emptyCustomer)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const activeRecords = activeSection === 'products' ? products : customers
  const activeCount = useMemo(() => activeRecords.length, [activeRecords])

  useEffect(() => {
    if (!isLoggedIn) return
    loadAdminData()
  }, [isLoggedIn])

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!response.ok) {
      throw new Error('The admin API request failed.')
    }

    return response.json()
  }

  async function loadAdminData() {
    setLoading(true)
    setNotice('')

    try {
      const [productData, customerData] = await Promise.all([
        request('/products'),
        request('/customers'),
      ])

      setProducts(productData)
      setCustomers(customerData)
    } catch (error) {
      setNotice('Start the mock API with npm run mock-api, then refresh the admin page.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')

    try {
      const admins = await request(
        `/admins?email=${encodeURIComponent(loginForm.email)}&password=${encodeURIComponent(
          loginForm.password,
        )}`,
      )

      if (admins.length === 0) {
        setLoginError('Invalid admin email or password.')
        return
      }

      setIsLoggedIn(true)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      setLoginError('Start the mock API with npm run mock-api before logging in.')
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    const productPayload = {
      ...productForm,
      price: Number(productForm.price),
      rate: Number(productForm.rate),
    }

    try {
      if (editingProductId) {
        const updatedProduct = await request(`/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...productPayload, id: editingProductId }),
        })
        setProducts(products.map((product) => (product.id === editingProductId ? updatedProduct : product)))
      } else {
        const newProduct = await request('/products', {
          method: 'POST',
          body: JSON.stringify(productPayload),
        })
        setProducts([...products, newProduct])
      }

      setProductForm(emptyProduct)
      setEditingProductId(null)
      setNotice('Product saved successfully.')
    } catch (error) {
      setNotice('Could not save the product. Check that the mock API is running.')
    }
  }

  async function saveCustomer(event) {
    event.preventDefault()

    try {
      if (editingCustomerId) {
        const updatedCustomer = await request(`/customers/${editingCustomerId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...customerForm, id: editingCustomerId }),
        })
        setCustomers(
          customers.map((customer) => (customer.id === editingCustomerId ? updatedCustomer : customer)),
        )
      } else {
        const newCustomer = await request('/customers', {
          method: 'POST',
          body: JSON.stringify(customerForm),
        })
        setCustomers([...customers, newCustomer])
      }

      setCustomerForm(emptyCustomer)
      setEditingCustomerId(null)
      setNotice('Customer saved successfully.')
    } catch (error) {
      setNotice('Could not save the customer. Check that the mock API is running.')
    }
  }

  async function deleteProduct(id) {
    try {
      await request(`/products/${id}`, { method: 'DELETE' })
      setProducts(products.filter((product) => product.id !== id))
      setNotice('Product deleted.')
    } catch (error) {
      setNotice('Could not delete the product.')
    }
  }

  async function deleteCustomer(id) {
    try {
      await request(`/customers/${id}`, { method: 'DELETE' })
      setCustomers(customers.filter((customer) => customer.id !== id))
      setNotice('Customer deleted.')
    } catch (error) {
      setNotice('Could not delete the customer.')
    }
  }

  function editProduct(product) {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      dsc: product.dsc,
      price: product.price,
      rate: product.rate,
      country: product.country,
      img: product.img,
    })
    setActiveSection('products')
  }

  function editCustomer(customer) {
    setEditingCustomerId(customer.id)
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
      status: customer.status,
    })
    setActiveSection('customers')
  }

  if (!isLoggedIn) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-panel">
          <p className="admin-eyebrow">Admin portal</p>
          <h1>Sign in</h1>
          <form onSubmit={handleLogin} className="admin-form">
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="admin@freshcart.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="admin123"
                required
              />
            </label>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="admin-primary-button">Login</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Store Admin</h1>
        <button
          className={activeSection === 'products' ? 'active' : ''}
          onClick={() => setActiveSection('products')}
        >
          Products
        </button>
        <button
          className={activeSection === 'customers' ? 'active' : ''}
          onClick={() => setActiveSection('customers')}
        >
          Customers
        </button>
        <button className="admin-logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Dashboard</p>
            <h2>{activeSection === 'products' ? 'Products' : 'Customers'}</h2>
          </div>
          <span>{activeCount} records</span>
        </header>

        {notice && <p className="admin-notice">{notice}</p>}
        {loading ? (
          <p className="admin-notice">Loading admin data...</p>
        ) : activeSection === 'products' ? (
          <ProductManager
            productForm={productForm}
            setProductForm={setProductForm}
            editingProductId={editingProductId}
            setEditingProductId={setEditingProductId}
            saveProduct={saveProduct}
            products={products}
            editProduct={editProduct}
            deleteProduct={deleteProduct}
          />
        ) : (
          <CustomerManager
            customerForm={customerForm}
            setCustomerForm={setCustomerForm}
            editingCustomerId={editingCustomerId}
            setEditingCustomerId={setEditingCustomerId}
            saveCustomer={saveCustomer}
            customers={customers}
            editCustomer={editCustomer}
            deleteCustomer={deleteCustomer}
          />
        )}
      </section>
    </main>
  )
}

function ProductManager({
  productForm,
  setProductForm,
  editingProductId,
  setEditingProductId,
  saveProduct,
  products,
  editProduct,
  deleteProduct,
}) {
  return (
    <>
      <form onSubmit={saveProduct} className="admin-card admin-grid-form">
        <input
          value={productForm.name}
          onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
          placeholder="Product name"
          required
        />
        <input
          value={productForm.dsc}
          onChange={(event) => setProductForm({ ...productForm, dsc: event.target.value })}
          placeholder="Description"
          required
        />
        <input
          type="number"
          value={productForm.price}
          onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
          placeholder="Price"
          required
        />
        <input
          type="number"
          min="1"
          max="5"
          value={productForm.rate}
          onChange={(event) => setProductForm({ ...productForm, rate: event.target.value })}
          placeholder="Rating"
          required
        />
        <input
          value={productForm.country}
          onChange={(event) => setProductForm({ ...productForm, country: event.target.value })}
          placeholder="Location"
          required
        />
        <input
          value={productForm.img}
          onChange={(event) => setProductForm({ ...productForm, img: event.target.value })}
          placeholder="Image URL"
          required
        />
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button">
            {editingProductId ? 'Update product' : 'Add product'}
          </button>
          {editingProductId && (
            <button
              type="button"
              onClick={() => {
                setProductForm(emptyProduct)
                setEditingProductId(null)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table">
        {products.map((product) => (
          <article key={product.id} className="admin-row">
            <img src={product.img} alt={product.name} />
            <div>
              <h3>{product.name}</h3>
              <p>{product.dsc}</p>
              <small>${product.price} | Rating {product.rate} | {product.country}</small>
            </div>
            <div className="admin-row-actions">
              <button onClick={() => editProduct(product)}>Edit</button>
              <button onClick={() => deleteProduct(product.id)} className="danger">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function CustomerManager({
  customerForm,
  setCustomerForm,
  editingCustomerId,
  setEditingCustomerId,
  saveCustomer,
  customers,
  editCustomer,
  deleteCustomer,
}) {
  return (
    <>
      <form onSubmit={saveCustomer} className="admin-card admin-grid-form">
        <input
          value={customerForm.name}
          onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })}
          placeholder="Customer name"
          required
        />
        <input
          type="email"
          value={customerForm.email}
          onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
          placeholder="Email"
          required
        />
        <input
          value={customerForm.phone}
          onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })}
          placeholder="Phone"
          required
        />
        <input
          value={customerForm.location}
          onChange={(event) => setCustomerForm({ ...customerForm, location: event.target.value })}
          placeholder="Location"
          required
        />
        <select
          value={customerForm.status}
          onChange={(event) => setCustomerForm({ ...customerForm, status: event.target.value })}
        >
          <option>Active</option>
          <option>Pending</option>
          <option>Blocked</option>
        </select>
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button">
            {editingCustomerId ? 'Update customer' : 'Add customer'}
          </button>
          {editingCustomerId && (
            <button
              type="button"
              onClick={() => {
                setCustomerForm(emptyCustomer)
                setEditingCustomerId(null)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-table">
        {customers.map((customer) => (
          <article key={customer.id} className="admin-row">
            <div className="admin-avatar">{customer.name.charAt(0)}</div>
            <div>
              <h3>{customer.name}</h3>
              <p>{customer.email} | {customer.phone}</p>
              <small>{customer.location} | {customer.status}</small>
            </div>
            <div className="admin-row-actions">
              <button onClick={() => editCustomer(customer)}>Edit</button>
              <button onClick={() => deleteCustomer(customer.id)} className="danger">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

export default Admin
