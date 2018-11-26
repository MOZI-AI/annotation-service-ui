import React from 'react';
import { GeneSelectionForm } from './gene-selection';
import { AnnotationSelection } from './annotation-selection'
import { Divider, Button, Row, Icon } from 'antd'

const availableAnnotations = [
    'Gene Ontology',
    'Reactome',
    'Small Molecules'
]

export class AnnotationService extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            genes: [],
            geneList: null,
            selectedAnnotations: []
        }
        // bind functions
        this.handleGeneAdded = this.handleGeneAdded.bind(this)
        this.handleGeneRemoved = this.handleGeneRemoved.bind(this)
        this.handleGeneListUploaded = this.handleGeneListUploaded.bind(this)
        this.handleAllGenesRemoved = this.handleAllGenesRemoved.bind(this)
        this.handleAnnotationsChanged = this.handleAnnotationsChanged.bind(this)
        this.handleAnnotationFilterChanged = this.handleAnnotationFilterChanged.bind(this)
    }


    handleGeneAdded(gene) {
        this.setState(state => {
            const genes = state.genes.slice(0);
            genes.push(gene);
            return { genes: genes }
        })
    }


    handleGeneRemoved(gene) {
        this.setState(state => {
            let genes = state.genes.slice(0);
            genes = genes.filter(g => g !== gene);
            return { genes: genes }
        })
    }

    handleGeneListUploaded(geneList) {
        const fileReader = new FileReader();
        fileReader.readAsText(geneList);
        fileReader.onload = () => {
            // TODO: check the file doesn't contain invalid characters        
            let geneArray = fileReader.result.split('\n')
            const uniqueGeneArray = geneArray.reduce((accumulator, value) => {
                if (value && accumulator.indexOf(value) === -1) accumulator.push(value);
                return accumulator;
            }, [])
            this.setState({ geneList: geneList, genes: uniqueGeneArray })
        };
    }

    handleAllGenesRemoved() {
        this.setState({ genes: [], geneList: null })
    }


    handleAnnotationsChanged(e) {
        this.setState(state => {
            let selectedAnnotations = state.selectedAnnotations.slice();
            e.target.checked ? selectedAnnotations.push({ name: e.target.name, filter: {} })
                : selectedAnnotations = selectedAnnotations.filter(a => a.name !== e.target.name);

            return { selectedAnnotations: selectedAnnotations }
        })
    }

    handleAnnotationFilterChanged(annotation, e) {
        this.setState(state => {
            let selectedAnnotations = state.selectedAnnotations.slice();
            let targetAnnotation = selectedAnnotations.find(a => a.name === annotation);
            targetAnnotation.filter[e.target.name] = e.target.value;

            return { selectedAnnotations: selectedAnnotations }
        })
    }

    isFormValid() {
        return this.state.selectedAnnotations.length && this.state.genes.length
    }

    componentDidUpdate() {
        console.log('State ', this.state)
    }

    render() {
        return (<React.Fragment>
            <GeneSelectionForm
                genes={this.state.genes}
                geneList={this.state.geneList}
                onGeneAdded={this.handleGeneAdded}
                onGeneRemoved={this.handleGeneRemoved}
                onGeneListUploaded={this.handleGeneListUploaded}
                onAllGenesRemoved={this.handleAllGenesRemoved}
            />
            <Divider dashed />
            <AnnotationSelection
                availableAnnotations={availableAnnotations}
                onAnnotationsChanged={this.handleAnnotationsChanged}
                onAnnotationFilterChanged={this.handleAnnotationFilterChanged}
                selectedAnnotations={this.state.selectedAnnotations}
            />
            <Divider dashed />
            <Row type='flex' justify='end'>
                <Button type='primary' disabled={!this.isFormValid()}>
                    <Icon type='check' />
                    Submit
                </Button>
            </Row>
        </React.Fragment>)
    }

}