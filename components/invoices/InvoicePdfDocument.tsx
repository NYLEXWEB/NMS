'use client';

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 16,
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2563eb',
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2,
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#0f172a',
    },
    invoiceMeta: {
        fontSize: 9,
        color: '#64748b',
        textAlign: 'right',
        marginTop: 3,
    },
    addresses: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    addressBox: {
        width: '46%',
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    name: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    text: {
        fontSize: 9,
        color: '#475569',
        marginTop: 2,
    },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingVertical: 6,
        paddingHorizontal: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    colDesc: { width: '55%' },
    colQty: { width: '15%', textAlign: 'center' },
    colRate: { width: '15%', textAlign: 'right' },
    colAmount: { width: '15%', textAlign: 'right' },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 24,
    },
    summaryBox: {
        width: '40%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderTopWidth: 1.5,
        borderTopColor: '#0f172a',
        marginTop: 4,
    },
    totalText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 36,
        right: 36,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
    },
});

interface InvoicePdfProps {
    invoice: any;
    settings: any;
}

export const InvoicePdfDocument: React.FC<InvoicePdfProps> = ({ invoice, settings }) => {
    const company = settings || {
        companyName: 'NYLEX',
        businessName: 'NYLEXWEB',
        phone: '+91 89214 42748',
        email: 'buildwithnylex@gmail.com',
        website: 'https://nylexweb.com',
        address: 'Kerala, India',
    };

    const client = invoice.clientId || {};

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandTitle}>{company.companyName || 'NYLEX'}</Text>
                        <Text style={styles.brandSubtitle}>Web Design & Development</Text>
                        <Text style={styles.text}>{company.phone} | {company.email}</Text>
                        <Text style={styles.text}>{company.website}</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceMeta}>Number: {invoice.invoiceNumber}</Text>
                        <Text style={styles.invoiceMeta}>
                            Date:{' '}
                            {invoice.invoiceDate
                                ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN')
                                : ''}
                        </Text>
                        <View style={styles.badge}>
                            <Text>{invoice.paymentType}</Text>
                        </View>
                    </View>
                </View>

                {/* Addresses */}
                <View style={styles.addresses}>
                    <View style={styles.addressBox}>
                        <Text style={styles.sectionTitle}>Billed From</Text>
                        <Text style={styles.name}>{company.businessName || 'NYLEXWEB'}</Text>
                        <Text style={styles.text}>{company.address}</Text>
                        <Text style={styles.text}>Phone: {company.phone}</Text>
                        <Text style={styles.text}>Email: {company.email}</Text>
                    </View>

                    <View style={styles.addressBox}>
                        <Text style={styles.sectionTitle}>Billed To</Text>
                        <Text style={styles.name}>{client.clientName || 'Valued Client'}</Text>
                        <Text style={styles.text}>{client.businessName}</Text>
                        {client.location && <Text style={styles.text}>{client.location}</Text>}
                        <Text style={styles.text}>Phone: {client.phone}</Text>
                        {client.email && <Text style={styles.text}>Email: {client.email}</Text>}
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Item Description</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colRate}>Rate</Text>
                        <Text style={styles.colAmount}>Amount</Text>
                    </View>
                    {invoice.items?.map((item: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colRate}>₹{item.rate?.toLocaleString('en-IN')}</Text>
                            <Text style={styles.colAmount}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                        </View>
                    ))}
                </View>

                {/* Financial Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.text}>Subtotal:</Text>
                            <Text style={styles.text}>₹{invoice.subtotal?.toLocaleString('en-IN')}</Text>
                        </View>
                        {invoice.gst > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.text}>GST:</Text>
                                <Text style={styles.text}>+ ₹{invoice.gst?.toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                        {invoice.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.text}>Discount:</Text>
                                <Text style={styles.text}>- ₹{invoice.discount?.toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>Total Amount:</Text>
                            <Text style={styles.totalText}>₹{invoice.total?.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.text}>Payment Method:</Text>
                            <Text style={styles.text}>{invoice.paymentMethod || 'UPI'}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for choosing NYLEX. We appreciate your business!</Text>
                    <Text style={{ marginTop: 2 }}>This is a computer-generated invoice document.</Text>
                </View>
            </Page>
        </Document>
    );
};
