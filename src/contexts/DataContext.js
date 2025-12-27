// src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cSnap, mSnap, pSnap, cuSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'cuentas')),
        getDocs(collection(db, 'users', user.uid, 'movimientos')),
        getDocs(collection(db, 'users', user.uid, 'pagos')),
        getDocs(collection(db, 'users', user.uid, 'cuotas'))
      ]);
      setCuentas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMovimientos(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPagos(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCuotas(cuSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) cargarDatos();
  }, [user, cargarDatos]);

  // CRUD Cuentas
  const guardarCuenta = async (data) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'cuentas'), data);
    setCuentas([...cuentas, { id: ref.id, ...data }]);
    return ref.id;
  };

  const actualizarCuenta = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'cuentas', id), data);
    setCuentas(cuentas.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const eliminarCuenta = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuentas', id));
    // Eliminar movimientos y pagos asociados
    for (const m of movimientos.filter(m => m.cuentaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    }
    for (const p of pagos.filter(p => p.cuentaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'pagos', p.id));
    }
    setCuentas(cuentas.filter(c => c.id !== id));
    setMovimientos(movimientos.filter(m => m.cuentaId !== id));
    setPagos(pagos.filter(p => p.cuentaId !== id));
  };

  // CRUD Movimientos
  const guardarMovimiento = async (data) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'movimientos'), { ...data, createdAt: new Date().toISOString() });
    setMovimientos([...movimientos, { id: ref.id, ...data }]);
    return ref.id;
  };

  const actualizarMovimiento = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'movimientos', id), data);
    setMovimientos(movimientos.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const eliminarMovimiento = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'movimientos', id));
    setMovimientos(movimientos.filter(m => m.id !== id));
  };

  // CRUD Pagos
  const guardarPago = async (data) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'pagos'), { ...data, createdAt: new Date().toISOString() });
    setPagos([...pagos, { id: ref.id, ...data }]);
    return ref.id;
  };

  const actualizarPago = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'pagos', id), data);
    setPagos(pagos.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const eliminarPago = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'pagos', id));
    setPagos(pagos.filter(p => p.id !== id));
  };

  // CRUD Cuotas
  const guardarCuota = async (data) => {
    if (!user) return;
    const ref = await addDoc(collection(db, 'users', user.uid, 'cuotas'), data);
    setCuotas([...cuotas, { id: ref.id, ...data }]);
    return ref.id;
  };

  const actualizarCuota = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'cuotas', id), data);
    setCuotas(cuotas.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const eliminarCuota = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'cuotas', id));
    setCuotas(cuotas.filter(c => c.id !== id));
    // Eliminar movimientos de esta cuota
    for (const m of movimientos.filter(m => m.cuotaId === id)) {
      await deleteDoc(doc(db, 'users', user.uid, 'movimientos', m.id));
    }
    setMovimientos(movimientos.filter(m => m.cuotaId !== id));
  };

  return (
    <DataContext.Provider value={{
      cuentas, movimientos, pagos, cuotas, loading,
      cargarDatos,
      guardarCuenta, actualizarCuenta, eliminarCuenta,
      guardarMovimiento, actualizarMovimiento, eliminarMovimiento,
      guardarPago, actualizarPago, eliminarPago,
      guardarCuota, actualizarCuota, eliminarCuota
    }}>
      {children}
    </DataContext.Provider>
  );
};
