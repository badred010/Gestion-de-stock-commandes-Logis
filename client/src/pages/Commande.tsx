import { useState } from 'react';
import { useGetAllProductsQuery } from '../redux/features/management/productApi';
import { Button, Col, Input, Row, Select, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import toastMessage from '../../src/lib/toastMessage';
import { Modal } from 'antd';


const { Title } = Typography;

interface SelectedProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const Commande = () => {
  const { data: productData, isLoading } = useGetAllProductsQuery(undefined);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [buyerInfo, setBuyerInfo] = useState({ name: '', address: '' });
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualProduct, setManualProduct] = useState({ name: '', price: 0 });


  const handleAddProduct = (id: string) => {
    const product = productData?.data.find((p: any) => p._id === id);
    if (!product) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        id: product._id,
        name: product.name,
        quantity: 1,
        price: product.price || 0,
      },
    ]);
  };

  const handleDeleteProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = <K extends keyof SelectedProduct>(
    index: number,
    key: K,
    value: SelectedProduct[K]
  ) => {
    setSelectedProducts(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const getFactureNumber = (): string => {
    const year = new Date().getFullYear();
    const key = `factureNumber_${year}`;
    const current = parseInt(localStorage.getItem(key) || "1", 10);
    const next = current + 1;
    localStorage.setItem(key, next.toString());
    return `${String(current).padStart(3, "0")}/${year}`;
  };
  


  const saveCommande = (docType: 'facture' | 'bon de livraison' | 'devis') => {
    const existing = JSON.parse(localStorage.getItem('commandes') || '[]');
  
    const newCommande = {
      id: Date.now(), 
      buyer: buyerInfo,
      products: selectedProducts,
      date: new Date().toISOString(),
      factureNumber: getFactureNumber(),
      typesGenerated: {
        facture: docType === 'facture',
        bon_de_livraison: docType === 'bon de livraison',
        devis: docType === 'devis',
      }
    };

    localStorage.setItem('commandes', JSON.stringify([...existing, newCommande]));
  };
  

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={2}>Nouvelle Commande</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Input
            placeholder="Nom de Client"
            value={buyerInfo.name}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <Input
            placeholder="Adresse"
            value={buyerInfo.address}
            onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })}
          />
        </Col>

        <Col span={24}>
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Ajouter un produit"
            optionFilterProp="children"
            onSelect={handleAddProduct}
            loading={isLoading}
            filterOption={(input, option) => {
                const children = option?.children ?? '';
                return String(children).toLowerCase().includes(input.toLowerCase());
              }}
          >
            {productData?.data.map((product: any) => (
              <Select.Option key={product._id} value={product._id}>
                {product.name} - {product.price} DH
              </Select.Option>
            ))}
          </Select>
          <Button
  style={{
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px dashed #1890ff',
    color: '#ffffff',
    backgroundColor:"#1890ff",
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  }}
  block
  onClick={() => setIsManualModalOpen(true)}
>
  <PlusOutlined /> Ajouter un produit manuellement
</Button>

        </Col>
        

        <Col span={24}>
  <Row gutter={16} style={{ marginTop: '1rem' }}>
    <Col span={10}>
      <Typography.Text strong>Produit</Typography.Text>
    </Col>
    <Col span={4}>
      <Typography.Text strong>Quantité</Typography.Text>
    </Col>
    <Col span={4}>
      <Typography.Text strong>Prix Unit.</Typography.Text>
    </Col>
    <Col span={6}>
      <Typography.Text strong>Actions</Typography.Text>
    </Col>
  </Row>
</Col>

{selectedProducts.map((product, index) => (
  <Col span={24} key={product.id}>
    <Row gutter={16} align="middle" style={{ marginTop: '0.5rem' }}>
      <Col span={10}>
        <Typography.Text>{product.name}</Typography.Text>
      </Col>
      
      <Col span={4}>
        <Input
          type="number"
          value={product.quantity}
          min={1}
          onChange={(e) => handleProductChange(index, 'quantity', +e.target.value)}
        />
      </Col>

      <Col span={4}>
        <Input
          type="number"
          value={product.price}
          min={0}
          onChange={(e) => handleProductChange(index, 'price', +e.target.value)}
        />
      </Col>

      <Col span={6}>
        <Button
          danger
          type="primary"
          onClick={() => handleDeleteProduct(index)}
        >
          Supprimer
        </Button>
      </Col>
    </Row>
  </Col>
))}
        <Col span={24} style={{ marginTop: '2rem'}}>
        <Button
  type="primary"
  size="large"
  icon={<PlusOutlined />}
  onClick={async () => {
    await saveCommande('bon de livraison');
    toastMessage({ icon: 'success', text: 'Commande enregistrée avec succès !' });
  }}
  disabled={!selectedProducts.length}
>
  Enregistrer la commande
</Button>

        </Col>
      </Row>
      <Modal
  title="Ajouter un produit manuellement"
  open={isManualModalOpen}
  onCancel={() => setIsManualModalOpen(false)}
  onOk={() => {
    if (manualProduct.name && manualProduct.price > 0) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2),
          name: manualProduct.name,
          quantity: 1,
          price: manualProduct.price,
        },
      ]);
      setManualProduct({ name: '', price: 0 });
      setIsManualModalOpen(false);
    }
  }}
  okText="Ajouter"
  cancelText="Annuler"
>
  <Input
    placeholder="Nom du produit"
    value={manualProduct.name}
    onChange={(e) => setManualProduct({ ...manualProduct, name: e.target.value })}
    style={{ marginBottom: '1rem' }}
  />
  <Input
    placeholder="Prix unitaire"
    type="number"
    value={manualProduct.price}
    onChange={(e) => setManualProduct({ ...manualProduct, price: parseFloat(e.target.value) })}
  />
</Modal>
    </div>
  );
};

export default Commande;
