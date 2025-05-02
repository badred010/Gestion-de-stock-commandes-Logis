import { useEffect, useState } from 'react';
import { Button, Table, Typography } from 'antd';
import { generateFacture, generateBonLivraison, generateDevis } from '../utils/DocumentGenerator.ts';
import Swal from 'sweetalert2';
import toastMessage from '../../src/lib/toastMessage';

const { Title } = Typography;

interface Commande {
  id: number;
  buyer: { name: string; address: string };
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  date: string;
  factureNumber: string;
  typesGenerated: {
    facture: boolean;
    livraison: boolean;
    devis: boolean;
  };
}

const ListeCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('commandes') || '[]');
    setCommandes(saved);
  }, []);

  const handleDownload = (commande: Commande, type: 'facture' | 'livraison' | 'devis') => {
    const documentData = {
      buyer: commande.buyer,
      products: commande.products,
      date: commande.date,
      factureNumber: commande.factureNumber,
    };

    switch (type) {
      case 'facture':
        generateFacture(documentData);
        break;
      case 'livraison':
        generateBonLivraison(documentData);
        break;
      case 'devis':
        generateDevis(documentData);
        break;
    }
  };

  const handleDeleteCommande = (commande: Commande) => {
    Swal.fire({
      title: 'Supprimer la commande ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCommandes = commandes.filter(c => c.id !== commande.id);
        setCommandes(updatedCommandes);
        localStorage.setItem('commandes', JSON.stringify(updatedCommandes));

        // Correct facture number if needed
        const [numberStr] = commande.factureNumber.split('/');
        const deletedNumber = parseInt(numberStr, 10);
        const year = new Date().getFullYear();
        const key = `factureNumber_${year}`;
        const currentStored = parseInt(localStorage.getItem(key) || '0', 10);

        if (deletedNumber === currentStored - 1) {
          localStorage.setItem(key, (currentStored - 1).toString());
        }

        toastMessage({ icon: 'success', text: 'Commande supprimée avec succès !' });
    }
    });
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'buyer',
      key: 'buyer',
      render: (buyer: any) => buyer.name,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Facture',
      dataIndex: 'factureNumber',
      key: 'factureNumber',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Commande) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Button onClick={() => handleDownload(record, 'facture')} type="primary">
            📄 Facture
          </Button>
          <Button onClick={() => handleDownload(record, 'livraison')} type="default">
            📦 Bon Livraison
          </Button>
          <Button onClick={() => handleDownload(record, 'devis')} type="dashed">
            💬 Devis
          </Button>
          <Button onClick={() => handleDeleteCommande(record)} danger type="primary">
            🗑️ Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={2}>Liste des Commandes</Title>

      <Table
        dataSource={commandes}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ListeCommandes;
