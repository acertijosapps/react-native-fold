import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FoldBookPane, FoldPane, useFold } from '@acertijosapps/react-native-fold';

type Message = {
    id: string;
    sender: string;
    subject: string;
    preview: string;
    body: string;
};

const MESSAGES: Message[] = [
    {
        id: '1',
        sender: 'Ana Rivera',
        subject: 'Diseño del onboarding',
        preview: 'Subí los flujos a Figma, ¿los revisas hoy?',
        body: 'Subí los flujos de onboarding a Figma. Faltan los estados vacíos y el de error de red. ¿Los revisas hoy antes de la daily?',
    },
    {
        id: '2',
        sender: 'Equipo Plataforma',
        subject: 'Release 2.4 en beta',
        preview: 'La 2.4 ya está en el canal beta para QA.',
        body: 'La versión 2.4 ya está desplegada en el canal beta. Incluye el nuevo sync offline y el fix de sesiones. QA arranca mañana.',
    },
    {
        id: '3',
        sender: 'Bruno Salas',
        subject: 'Métricas de la semana',
        preview: 'Retención D7 subió 3 puntos.',
        body: 'La retención D7 subió 3 puntos tras el cambio de notificaciones. El churn en el plan free sigue plano. Detalle en el dashboard.',
    },
    {
        id: '4',
        sender: 'Soporte',
        subject: 'Ticket #4821 escalado',
        preview: 'Cliente reporta crash al plegar el dispositivo.',
        body: 'El cliente reporta un crash al plegar el dispositivo en la pantalla de detalle. Adjunto el stack trace. ¿Lo tomas en este sprint?',
    },
];

const FoldStatusBar = (): React.JSX.Element => {
    const fold = useFold();

    if (fold == null) {
        return (
            <View style={styles.status}>
                <Text style={styles.statusText}>Plano · sin plegado</Text>
            </View>
        );
    }

    return (
        <View style={styles.status}>
            <Text style={styles.statusText}>
                {fold.orientation} · media {fold.isHalfOpened ? 'sí' : 'no'} · separa{' '}
                {fold.isSeparating ? 'sí' : 'no'}
            </Text>
            <Text style={styles.statusDim}>
                bisagra {Math.round(fold.bounds.x)},{Math.round(fold.bounds.y)} ·{' '}
                {Math.round(fold.bounds.width)}×{Math.round(fold.bounds.height)} dp
            </Text>
        </View>
    );
};

type MessageRowProps = {
    message: Message;
    isSelected: boolean;
    onPress: () => void;
};

const MessageRow = ({ message, isSelected, onPress }: MessageRowProps): React.JSX.Element => {
    return (
        <Pressable
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={onPress}
        >
            <Text style={styles.rowSender}>{message.sender}</Text>
            <Text style={styles.rowSubject}>{message.subject}</Text>
            <Text
                style={styles.rowPreview}
                numberOfLines={1}
            >
                {message.preview}
            </Text>
        </Pressable>
    );
};

type MessageListProps = {
    messages: Message[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

const MessageList = ({ messages, selectedId, onSelect }: MessageListProps): React.JSX.Element => {
    return (
        <ScrollView style={styles.list}>
            {messages.map((message) => (
                <MessageRow
                    key={message.id}
                    message={message}
                    isSelected={message.id === selectedId}
                    onPress={() => onSelect(message.id)}
                />
            ))}
        </ScrollView>
    );
};

type MessageDetailProps = {
    message: Message | null;
    onBack?: () => void;
};

const MessageDetail = ({ message, onBack }: MessageDetailProps): React.JSX.Element => {
    if (message == null) {
        return (
            <View style={styles.detailEmpty}>
                <Text style={styles.detailEmptyText}>Selecciona un mensaje</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.detail}>
            {onBack != null && (
                <Pressable
                    style={styles.back}
                    onPress={onBack}
                >
                    <Text style={styles.backText}>‹ Bandeja</Text>
                </Pressable>
            )}
            <Text style={styles.detailSubject}>{message.subject}</Text>
            <Text style={styles.detailSender}>{message.sender}</Text>
            <Text style={styles.detailBody}>{message.body}</Text>
        </ScrollView>
    );
};

const InboxScreen = (): React.JSX.Element => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = MESSAGES.find((message) => message.id === selectedId) ?? null;

    const list = (
        <MessageList
            messages={MESSAGES}
            selectedId={selectedId}
            onSelect={setSelectedId}
        />
    );
    const detail = <MessageDetail message={selected} />;

    return (
        <View style={styles.screen}>
            <FoldStatusBar />
            <FoldBookPane
                splitWhenWide
                start={list}
                end={detail}
                fallback={
                    <FoldPane
                        primary={list}
                        secondary={detail}
                        fallback={
                            selected != null ? (
                                <MessageDetail
                                    message={selected}
                                    onBack={() => setSelectedId(null)}
                                />
                            ) : (
                                list
                            )
                        }
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 44,
    },
    status: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1e293b',
    },
    statusText: {
        color: '#e2e8f0',
        fontSize: 13,
        fontWeight: '600',
    },
    statusDim: {
        color: '#94a3b8',
        fontSize: 11,
        marginTop: 2,
    },
    list: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    row: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e2e8f0',
    },
    rowSelected: {
        backgroundColor: '#dbeafe',
    },
    rowSender: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    rowSubject: {
        fontSize: 14,
        color: '#334155',
        marginTop: 1,
    },
    rowPreview: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    detail: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    back: {
        paddingVertical: 8,
    },
    backText: {
        fontSize: 15,
        color: '#2563eb',
        fontWeight: '600',
    },
    detailSubject: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginTop: 4,
    },
    detailSender: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    detailBody: {
        fontSize: 15,
        color: '#1e293b',
        lineHeight: 22,
        marginTop: 16,
    },
    detailEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    detailEmptyText: {
        fontSize: 15,
        color: '#94a3b8',
    },
});

export default InboxScreen;
