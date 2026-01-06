
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Config ---
const SUPABASE_URL = 'https://kvwfvliapmmwkojxhsxv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d2Z2bGlhcG1td2tvamRoc3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDg3OTAsImV4cCI6MjA3OTgyNDc5MH0.Bn9GMcNYqLJgVkMML_dvXg1HZL1hJjN38zD9aMZkjwk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Types ---
type UserRole = 'client' | 'admin';
type OrderStatus = 'Pendente' | 'Pendente de Confirmação' | 'Em Produção' | 'Saiu para Entrega' | 'Entregue';
type AdminSubView = 'orders' | 'products' | 'users';

interface User { name: string; email: string; role: UserRole; phone?: string; }
interface Product { id: number; name: string; image: string; price: number; is_promotion?: boolean; }
interface CartItem extends Product { quantity: number; }
interface Order { id: number; date: string; items: CartItem[]; total: number; status: OrderStatus; address: string; user_name: string; user_phone?: string; payment_method?: string; change_for?: string; }

const LOGO_URL = "https://i.ibb.co/wtK5Lz0/GD-Logo.jpg";
const PIX_QR_URL = "https://i.ibb.co/j9LH2r32/QRCODE.jpg";

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, name: 'Bem Casado', price: 2.00, image: 'https://i.ibb.co/HLw4mQfH/Bem-Casado.png', is_promotion: true },
  { id: 2, name: 'Brigadeiro Tradicional', price: 2.00, image: 'https://i.ibb.co/B2gPLvJF/Brigadeiro-Tradicional.png' },
  { id: 4, name: 'Churros', price: 2.00, image: 'https://i.ibb.co/hRHLjLKQ/Churros.png', is_promotion: true },
  { id: 8, name: 'Ninho com Nutella', price: 2.00, image: 'https://i.ibb.co/N6pbQZ9J/Ninho-com-Nutella.png' },
];

// --- Icons ---
const IconCart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconList = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;

// --- Components ---

const AuthView: React.FC<any> = ({
  isRegistering, setIsRegistering, authRole, setAuthRole, authName, setAuthName, authEmail, setAuthEmail, authPass, setAuthPass, authPassConfirm, setAuthPassConfirm, authAdminCode, setAuthAdminCode, authPhone, setAuthPhone, error, onLogin, onRegister
}) => (
  <div className="auth-container">
    <div className="card auth-card">
      <div className="logo-container"><img src={LOGO_URL} alt="Logo" className="logo" /></div>
      <h2>{isRegistering ? 'Criar Conta' : 'Acessar Conta'}</h2>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={isRegistering ? onRegister : onLogin}>
        {!isRegistering ? (
          <>
            <input type="email" placeholder="E-mail" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            <input type="password" placeholder="Senha" value={authPass} onChange={e => setAuthPass(e.target.value)} required />
            <button type="submit" className="btn-primary">Entrar</button>
            <div className="toggle-auth-wrapper">Não tem conta? <span className="link-primary" onClick={() => setIsRegistering(true)}>Cadastre-se</span></div>
          </>
        ) : (
          <>
            <div className="role-selector">
              <label className={authRole === 'client' ? 'active' : ''}><input type="radio" checked={authRole === 'client'} onChange={() => setAuthRole('client')} /> Cliente</label>
              <label className={authRole === 'admin' ? 'active' : ''}><input type="radio" checked={authRole === 'admin'} onChange={() => setAuthRole('admin')} /> Admin</label>
            </div>
            {authRole === 'admin' && <input type="text" placeholder="Código de Autorização Admin" value={authAdminCode} onChange={e => setAuthAdminCode(e.target.value)} required />}
            <input type="text" placeholder="Nome Completo" value={authName} onChange={e => setAuthName(e.target.value)} required />
            <input type="email" placeholder="E-mail" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            <input type="tel" placeholder="Telefone" value={authPhone} onChange={e => setAuthPhone(e.target.value)} required />
            <input type="password" placeholder="Senha (10-16 char)" value={authPass} onChange={e => setAuthPass(e.target.value)} minLength={10} maxLength={16} required />
            <input type="password" placeholder="Confirmar Senha" value={authPassConfirm} onChange={e => setAuthPassConfirm(e.target.value)} required />
            <button type="submit" className="btn-primary">Finalizar Cadastro</button>
            <div className="toggle-auth-wrapper">Já tem conta? <span className="link-primary" onClick={() => setIsRegistering(false)}>Entrar</span></div>
          </>
        )}
      </form>
    </div>
  </div>
);

const ClientView = ({ user, setView, cartCount, products, addToCart }: any) => (
  <div className="main-layout">
    <header className="app-header">
      <img src={LOGO_URL} alt="Logo" className="header-logo" />
      <div className="header-actions">
        {user?.role === 'admin' && <button onClick={() => setView('admin')} className="btn-secondary">Admin</button>}
        <div className="cart-icon-wrapper" onClick={() => setView('cart')}>
          <IconCart /> {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
        <button className="btn-icon" onClick={() => setView('auth')}><IconUser /></button>
      </div>
    </header>
    <div className="product-container">
      {products.map((p: Product) => (
        <div key={p.id} className={`product-card ${p.is_promotion ? 'promo' : ''}`}>
          <img src={p.image} alt={p.name} />
          <div className="product-info">
            <h3>{p.name}</h3>
            <p className="price">R$ {p.price.toFixed(2)}</p>
            <button onClick={() => addToCart(p)} className="btn-add">Adicionar</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CartView = ({ cart, setView, handleCheckout }: any) => {
  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const [method, setMethod] = useState('pickup');
  const [payment, setPayment] = useState('pix');
  const [addr, setAddr] = useState('');

  return (
    <div className="main-layout">
      <header className="app-header">
        <button onClick={() => setView('client')} className="btn-back">← Voltar</button>
        <h2>Carrinho</h2>
        <div style={{width: 24}}></div>
      </header>
      <div className="cart-content">
        {cart.length === 0 ? <p className="empty-msg">Seu carrinho está vazio.</p> : (
          <>
            {cart.map((item: CartItem) => (
              <div key={item.id} className="cart-item">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="total-row"><strong>Total:</strong> <strong>R$ {total.toFixed(2)}</strong></div>
            <hr/>
            <div className="section">
              <h3>Entrega</h3>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="pickup">Retirada</option>
                <option value="delivery">Entrega</option>
              </select>
              {method === 'delivery' && <input type="text" placeholder="Seu endereço" value={addr} onChange={e => setAddr(e.target.value)} />}
            </div>
            <div className="section">
              <h3>Pagamento</h3>
              <select value={payment} onChange={e => setPayment(e.target.value)}>
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
              </select>
              {payment === 'pix' && (
                <div className="pix-area">
                  <img src={PIX_QR_URL} alt="QR Code" className="pix-qr" />
                  <p>Grazyelle Oliveira da Cunha</p>
                </div>
              )}
            </div>
            <button className="btn-primary" onClick={() => handleCheckout(method, payment, addr)}>Finalizar Pedido</button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminView = ({ orders, users, setView, updateStatus }: any) => {
  const [tab, setTab] = useState<AdminSubView>('orders');
  return (
    <div className="main-layout">
      <header className="app-header">
        <h2>Painel Admin</h2>
        <button onClick={() => setView('client')} className="btn-secondary">Sair</button>
      </header>
      <nav className="admin-nav">
        <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'active' : ''}><IconList/> Pedidos</button>
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'active' : ''}><IconUsers/> Usuários</button>
      </nav>
      <div className="admin-content">
        {tab === 'orders' && orders.map((o: Order) => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              <strong>{o.user_name}</strong>
              <span className={`status ${o.status.toLowerCase().replace(/ /g, '-')}`}>{o.status}</span>
            </div>
            <p>{o.address}</p>
            <p>Total: R$ {o.total.toFixed(2)}</p>
            <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
               <option value="Pendente">Pendente</option>
               <option value="Em Produção">Em Produção</option>
               <option value="Entregue">Entregue</option>
            </select>
          </div>
        ))}
        {tab === 'users' && users.map((u: User, i: number) => (
          <div key={i} className="user-card">
            <strong>{u.name}</strong>
            <p>{u.email} - {u.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState<'auth' | 'client' | 'admin' | 'cart'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [authRole, setAuthRole] = useState<UserRole>('client');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authPassConfirm, setAuthPassConfirm] = useState('');
  const [authAdminCode, setAuthAdminCode] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchAdminData = async () => {
        try {
          const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          const { data: u } = await supabase.from('app_users').select('*');
          if (o) setOrders(o);
          if (u) setUsers(u);
        } catch (e) { console.error("Erro fetch admin:", e); }
      };
      fetchAdminData();
    }
  }, [user]);

  const onLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error: dbErr } = await supabase.from('app_users').select('*').eq('email', authEmail).single();
      if (dbErr) throw dbErr;
      if (data && data.password === authPass) {
        setUser(data);
        setView(data.role === 'admin' ? 'admin' : 'client');
      } else setError('Credenciais inválidas.');
    } catch (err: any) {
      console.error("Erro Login:", err);
      setError('Falha na conexão: Verifique se ad-blockers estão ativos.');
    }
  };

  const onRegister = async (e: any) => {
    e.preventDefault();
    setError('');
    if (authPass !== authPassConfirm) return setError('Senhas não conferem.');
    if (authRole === 'admin' && authAdminCode !== 'GDADMIN2024') return setError('Código admin inválido.');
    
    const newUser = { name: authName, email: authEmail, phone: authPhone, password: authPass, role: authRole };
    
    try {
      const { error: dbErr } = await supabase.from('app_users').insert([newUser]);
      if (dbErr) throw dbErr;
      setShowAddMoreModal(true);
    } catch (err: any) {
      console.error("Erro Registro:", err);
      setError('Erro de rede: Tente desativar extensões de bloqueio de anúncios.');
    }
  };

  const handleCheckout = async (method: string, payment: string, addr: string) => {
    try {
      const newOrder = {
        user_name: user?.name,
        user_email: user?.email,
        user_phone: user?.phone,
        total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        status: payment === 'pix' ? 'Pendente de Confirmação' : 'Pendente',
        address: method === 'pickup' ? 'RETIRADA' : addr,
        items: cart,
        payment_method: payment
      };
      await supabase.from('orders').insert([newOrder]);
      setCart([]);
      alert('Pedido realizado!');
      setView('client');
    } catch (e) { console.error("Erro Checkout:", e); }
  };

  return (
    <>
      <style>{`
        :root { --primary: #D32F2F; --bg: #F9F9F9; --card: #FFF; --text: #212121; }
        body { margin: 0; font-family: sans-serif; background: var(--bg); color: var(--text); }
        .main-layout { max-width: 600px; margin: 0 auto; min-height: 100vh; padding-bottom: 20px; background: white; }
        .app-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee; position: sticky; top: 0; background: white; z-index: 10; }
        .header-logo { height: 40px; border-radius: 50%; }
        .header-actions { display: flex; gap: 10px; align-items: center; }
        .card { background: var(--card); padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--primary); padding: 1rem; }
        .auth-card { width: 100%; max-width: 400px; text-align: center; }
        .logo-container img { width: 80px; border-radius: 50%; margin-bottom: 1rem; border: 3px solid white; }
        input, select { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box; }
        .btn-primary { background: var(--primary); color: white; border: none; padding: 14px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: bold; }
        .btn-secondary { background: #eee; border: none; padding: 8px 12px; border-radius: 20px; cursor: pointer; }
        .product-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
        .product-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
        .product-card img { width: 100%; height: 140px; object-fit: cover; }
        .product-info { padding: 10px; text-align: center; }
        .price { color: var(--primary); font-weight: bold; }
        .cart-badge { background: var(--primary); color: white; font-size: 10px; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; position: absolute; top: -5px; right: -5px; }
        .cart-icon-wrapper { position: relative; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .role-selector { display: flex; gap: 10px; margin-bottom: 10px; }
        .role-selector label { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; text-align: center; }
        .role-selector label.active { background: var(--primary); color: white; border-color: var(--primary); }
        .role-selector input { display: none; }
        .pix-qr { width: 200px; height: 200px; border: 1px solid #eee; margin: 10px 0; }
        .admin-nav { display: flex; border-bottom: 1px solid #eee; }
        .admin-nav button { flex: 1; padding: 15px; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .admin-nav button.active { border-bottom: 3px solid var(--primary); color: var(--primary); }
        .order-card, .user-card { border: 1px solid #eee; padding: 15px; margin: 10px; border-radius: 10px; }
        .status { font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 10px; }
        .status.pendente { background: #FFF3E0; color: #E65100; }
        .error-msg { background: #ffebee; color: #c62828; padding: 10px; border-radius: 8px; font-size: 14px; margin-bottom: 15px; border: 1px solid #ef9a9a; }
        .link-primary { color: var(--primary); font-weight: bold; cursor: pointer; text-decoration: underline; }
      `}</style>

      {view === 'auth' && <AuthView {...{isRegistering, setIsRegistering, authRole, setAuthRole, authName, setAuthName, authEmail, setAuthEmail, authPass, setAuthPass, authPassConfirm, setAuthPassConfirm, authAdminCode, setAuthAdminCode, authPhone, setAuthPhone, error, onLogin, onRegister}} />}
      {view === 'client' && <ClientView {...{user, setView, products: FALLBACK_PRODUCTS}} cartCount={cart.length} addToCart={(p: any) => setCart([...cart, {...p, quantity: 1}])} />}
      {view === 'cart' && <CartView cart={cart} setView={setView} handleCheckout={handleCheckout} />}
      {view === 'admin' && <AdminView orders={orders} users={users} setView={setView} updateStatus={(id: number, s: string) => supabase.from('orders').update({status: s}).eq('id', id).then(() => window.location.reload())} />}

      {showAddMoreModal && (
        <div className="modal-overlay">
          <div className="card" style={{maxWidth: 300, textAlign: 'center'}}>
            <h3 style={{marginTop: 0}}>Sucesso!</h3>
            <p>Deseja incluir mais um usuário?</p>
            <div style={{display: 'flex', gap: 10}}>
              <button className="btn-primary" onClick={() => { 
                setShowAddMoreModal(false); 
                setAuthName(''); setAuthEmail(''); setAuthPhone(''); setAuthPass(''); setAuthPassConfirm(''); setAuthAdminCode('');
              }}>Sim</button>
              <button className="btn-secondary" style={{flex: 1}} onClick={() => { setShowAddMoreModal(false); setIsRegistering(false); }}>Não</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
